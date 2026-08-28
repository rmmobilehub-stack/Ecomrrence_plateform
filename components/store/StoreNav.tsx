'use client';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartProvider';
import CartDrawer from './CartDrawer';
import BrandMark from '@/components/ui/BrandMark';

export default function StoreNav({ slug, homeHref, name, logo, announcement }: { slug: string; homeHref: string; name: string; logo: string; announcement?: string }) {
  const [open, setOpen] = useState(false); const { count } = useCart();
  return <><nav className="store-navbar"><Link href={homeHref} className="store-nav-logo">{logo ? <img src={logo} className="store-logo-image" alt=""/> : <BrandMark size={17} className="store-logo-mark"/>}{name}</Link><div className="store-nav-links"><Link className="store-nav-link" href={homeHref}>Home</Link><Link className="store-nav-link" href={`/store/${slug}/products`}>Shop</Link><span className="nav-assurance">{announcement || 'Cash on delivery'}</span></div><button className="cart-btn" onClick={() => setOpen(true)} aria-label="Open cart"><ShoppingBag size={19}/>{count > 0 && <span className="cart-count">{count}</span>}</button></nav><CartDrawer slug={slug} open={open} onClose={() => setOpen(false)}/></>;
}
