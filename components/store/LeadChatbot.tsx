'use client';

import Link from 'next/link';
import { ArrowRight, Bot, MessageCircle, Send, X } from 'lucide-react';
import { useMemo, useState } from 'react';

type Message = { role: 'visitor' | 'assistant'; message: string };
type Stage = 'idle' | 'name' | 'contact' | 'interest' | 'submitting' | 'done';
type ProductSummary = { name: string; price: number };

type Props = {
  slug: string;
  storeName: string;
  description: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  products: ProductSummary[];
  shopHref: string;
};

export default function LeadChatbot({ slug, storeName, description, currency, deliveryFee, freeDeliveryThreshold, products, shopHref }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', message: `Hi! I’m the ${storeName} assistant. I can help with products, delivery, or arrange a call from our team.` },
  ]);
  const [stage, setStage] = useState<Stage>('idle');
  const [value, setValue] = useState('');
  const [lead, setLead] = useState({ name: '', contact: '', interest: '' });

  const price = useMemo(() => new Intl.NumberFormat(currency === 'PKR' ? 'en-PK' : 'en-US', { style: 'currency', currency }).format, [currency]);
  const add = (role: Message['role'], message: string) => setMessages((current) => [...current, { role, message }]);

  const deliveryAnswer = () => {
    if (deliveryFee <= 0) return 'We offer cash on delivery, and delivery is currently free.';
    if (freeDeliveryThreshold > 0) return `Cash on delivery is available. Delivery costs ${price(deliveryFee)}, and becomes free above ${price(freeDeliveryThreshold)}.`;
    return `Cash on delivery is available. The delivery fee is ${price(deliveryFee)}.`;
  };

  const submitLead = async (interest: string, transcript: Message[]) => {
    setStage('submitting');
    try {
      const response = await fetch(`/api/store/${slug}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, interest, conversation: transcript, website: '' }),
      });
      if (!response.ok) throw new Error('Could not save');
      add('assistant', `Thanks, ${lead.name}! Your request has been saved. Our team will contact you using ${lead.contact}.`);
      setStage('done');
    } catch {
      add('assistant', 'I could not save that request right now. Please try again or use the WhatsApp button.');
      setStage('interest');
    }
  };

  const handleMessage = async (raw: string) => {
    const text = raw.trim();
    if (!text || stage === 'submitting') return;
    const visitorMessage = { role: 'visitor' as const, message: text };
    setMessages((current) => [...current, visitorMessage]);
    setValue('');

    if (stage === 'name') {
      if (text.length < 2) { add('assistant', 'Please enter your name so our team knows who to contact.'); return; }
      setLead((current) => ({ ...current, name: text }));
      setStage('contact');
      add('assistant', `Nice to meet you, ${text}. What phone number or email should we use?`);
      return;
    }
    if (stage === 'contact') {
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      const validPhone = text.replace(/\D/g, '').length >= 7;
      if (!validEmail && !validPhone) { add('assistant', 'Please enter a valid phone number or email address.'); return; }
      setLead((current) => ({ ...current, contact: text }));
      setStage('interest');
      add('assistant', 'What product or type of help are you interested in?');
      return;
    }
    if (stage === 'interest') {
      setLead((current) => ({ ...current, interest: text }));
      await submitLead(text, [...messages, visitorMessage]);
      return;
    }
    if (stage === 'done') {
      add('assistant', 'Your request is already with our team. You can also browse the collection while you wait.');
      return;
    }

    const intent = text.toLowerCase();
    if (/product|shop|item|price|collection|hoodie|shirt|tee|tote/.test(intent)) {
      const catalogue = products.slice(0, 4).map((product) => `${product.name} — ${price(product.price)}`).join('\n');
      add('assistant', catalogue ? `Here are some products you can explore:\n${catalogue}` : 'The catalogue is being prepared. Please check the Shop page shortly.');
    } else if (/deliver|shipping|payment|cod|cash/.test(intent)) {
      add('assistant', deliveryAnswer());
    } else if (/about|store|business|who/.test(intent)) {
      add('assistant', description || `${storeName} offers a simple online catalogue with cash on delivery.`);
    } else if (/human|team|contact|call|callback|help|buy|order/.test(intent)) {
      setStage('name');
      add('assistant', 'Sure—I can ask our team to contact you. What is your name?');
    } else {
      add('assistant', 'I can help with products, prices, delivery, or connect you with our team. Choose an option below or ask a related question.');
    }
  };

  const placeholder = stage === 'name' ? 'Your name' : stage === 'contact' ? 'Phone or email' : stage === 'interest' ? 'What are you interested in?' : 'Ask about products or delivery…';

  return <>
    <button className={`chat-launcher ${open ? 'open' : ''}`} type="button" onClick={() => setOpen((current) => !current)} aria-label={open ? 'Close store assistant' : 'Open store assistant'}>
      {open ? <X size={22}/> : <><MessageCircle size={21}/><span>Ask us</span></>}
    </button>
    {open && <section className="lead-chat" role="dialog" aria-label={`${storeName} assistant`}>
      <header className="lead-chat-header"><span className="lead-chat-avatar"><Bot size={19}/></span><div><strong>{storeName} assistant</strong><small><span/> Online</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18}/></button></header>
      <div className="lead-chat-messages" aria-live="polite">
        {messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}>{message.message}</div>)}
        {stage === 'idle' && <div className="chat-quick-actions">
          <button type="button" onClick={() => void handleMessage('Show me the products')}>Products & prices</button>
          <button type="button" onClick={() => void handleMessage('Tell me about delivery and payment')}>Delivery & COD</button>
          <button type="button" onClick={() => void handleMessage('I want to talk to your team')}>Talk to the team</button>
        </div>}
        {stage === 'done' && <Link className="chat-shop-link" href={shopHref}>Browse collection <ArrowRight size={14}/></Link>}
      </div>
      <form className="lead-chat-input" onSubmit={(event) => { event.preventDefault(); void handleMessage(value); }}>
        <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} disabled={stage === 'submitting'} aria-label="Chat message"/>
        <button type="submit" disabled={!value.trim() || stage === 'submitting'} aria-label="Send message"><Send size={17}/></button>
      </form>
      <small className="lead-chat-privacy">Contact details are used only to respond to your request.</small>
    </section>}
  </>;
}
