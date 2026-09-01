'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from './ImageUpload';
import { formatMoney } from '@/lib/currency';

type Variant = { name: string; options: string[]; priceModifier: number };
type Property = { key: string; value: string; type: 'text'; options?: string[] };
type ProductFormData = {
  id?: string; name: string; description: string; price: number; comparePrice: number; discount: number;
  stock: number; sku: string; status: string; categoryId: string; tags: string[]; images: string[];
  customProperties: Property[]; variants: Variant[];
};

const empty: ProductFormData = { name: '', description: '', price: 0, comparePrice: 0, discount: 0, stock: 0, sku: '', status: 'draft', categoryId: '', tags: [], images: [], customProperties: [], variants: [] };

export default function ProductForm({ id }: { id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<ProductFormData>(empty);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/categories').then(response => response.json()).then(data => setCategories(data.categories ?? []));
    if (id) fetch(`/api/admin/products/${id}`).then(response => response.json()).then(data => data.product && setForm({ ...empty, ...data.product }));
  }, [id]);

  const update = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => setForm(current => ({ ...current, [key]: value }));
  const sizeIndex = form.variants.findIndex(variant => variant.name.toLowerCase() === 'size');
  const hasSizes = sizeIndex >= 0;
  const toggleSizes = () => update('variants', hasSizes ? form.variants.filter((_, index) => index !== sizeIndex) : [...form.variants, { name: 'Size', options: ['S', 'M', 'L', 'XL'], priceModifier: 0 }]);
  const salePrice = Math.round(form.price * (1 - Math.min(100, Math.max(0, form.discount)) / 100) * 100) / 100;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    const product = { ...form, comparePrice: form.discount > 0 ? form.price : form.comparePrice, thumbnail: form.images[0] ?? '' };
    const response = await fetch(id ? `/api/admin/products/${id}` : '/api/admin/products', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
    if (response.ok) { router.push('/admin/products'); router.refresh(); return; }
    setError((await response.json()).error ?? 'Unable to save product'); setSaving(false);
  };

  const updateVariant = (index: number, value: Partial<Variant>) => update('variants', form.variants.map((entry, itemIndex) => itemIndex === index ? { ...entry, ...value } : entry));
  const updateProperty = (index: number, value: Partial<Property>) => update('customProperties', form.customProperties.map((entry, itemIndex) => itemIndex === index ? { ...entry, ...value } : entry));

  return <form onSubmit={submit} className="editor-form">
    <section className="glass-card form-panel"><h2>Product details</h2>
      <div className="grid-2"><label className="form-group"><span className="form-label">Name</span><input className="form-input" required value={form.name} onChange={event => update('name', event.target.value)}/></label><label className="form-group"><span className="form-label">SKU</span><input className="form-input" value={form.sku} onChange={event => update('sku', event.target.value)}/></label></div>
      <label className="form-group"><span className="form-label">Description</span><textarea className="form-input form-textarea" rows={5} value={form.description} onChange={event => update('description', event.target.value)}/></label>
      <div className="grid-3"><label className="form-group"><span className="form-label">Price (PKR)</span><input className="form-input" required min="0" step="1" type="number" value={form.price} onChange={event => update('price', Number(event.target.value))}/>{form.discount > 0 && <small className="form-hint">Shown crossed out: {formatMoney(form.price)}</small>}</label><label className="form-group"><span className="form-label">Product discount (%)</span><input className="form-input" min="0" max="100" type="number" value={form.discount} onChange={event => update('discount', Number(event.target.value))}/>{form.discount > 0 && <small className="form-hint">Customer pays: {formatMoney(salePrice)}</small>}</label><label className="form-group"><span className="form-label">Stock</span><input className="form-input" min="0" type="number" value={form.stock} onChange={event => update('stock', Number(event.target.value))}/></label></div>
      {form.discount === 0 && <label className="form-group"><span className="form-label">Compare price (optional)</span><input className="form-input" min="0" step="0.01" type="number" value={form.comparePrice} onChange={event => update('comparePrice', Number(event.target.value))}/><small className="form-hint">Only use this for a manual crossed-out price when no product discount is active.</small></label>}
      <div className="grid-2"><label className="form-group"><span className="form-label">Category</span><select className="form-select" value={form.categoryId} onChange={event => update('categoryId', event.target.value)}><option value="">Uncategorized</option>{categories.map(category => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label className="form-group"><span className="form-label">Status</span><select className="form-select" value={form.status} onChange={event => update('status', event.target.value)}><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label></div>
      <label className="form-group"><span className="form-label">Tags</span><input className="form-input" placeholder="summer, new, bestseller" value={form.tags.join(', ')} onChange={event => update('tags', event.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}/></label>
    </section>
    <section className="glass-card form-panel"><h2>Images</h2><p className="form-hint">The first image becomes the storefront cover image.</p><ImageUpload images={form.images} onChange={images => update('images', images)}/></section>
    <section className="glass-card form-panel"><div className="variant-heading"><div><h2>Product options</h2><p className="form-hint">Only enable options this product actually needs.</p></div><label className="size-toggle"><input type="checkbox" checked={hasSizes} onChange={toggleSizes}/><span className="size-toggle-ui"/><span>This product has sizes</span></label></div>{hasSizes && <p className="variant-success-note">Size choices are enabled. Edit S, M, L, XL below if needed.</p>}<div className="repeat-list">{form.variants.map((variant, index) => <div className="repeat-row variant-row" key={index}><input className="form-input" placeholder="Option name, e.g. Size" value={variant.name} onChange={event => updateVariant(index, { name: event.target.value })}/><input className="form-input" placeholder="Values, comma separated" value={variant.options.join(', ')} onChange={event => updateVariant(index, { options: event.target.value.split(',').map(option => option.trim()).filter(Boolean) })}/><input className="form-input" placeholder="Price change" type="number" step="0.01" value={variant.priceModifier} onChange={event => updateVariant(index, { priceModifier: Number(event.target.value) })}/><button type="button" className="btn btn-danger btn-sm" onClick={() => update('variants', form.variants.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div><button type="button" className="btn btn-secondary btn-sm" onClick={() => update('variants', [...form.variants, { name: '', options: [], priceModifier: 0 }])}>Add another option</button><h3 style={{ marginTop: 24 }}>Custom properties</h3><div className="repeat-list">{form.customProperties.map((property, index) => <div className="repeat-row" key={index}><input className="form-input" placeholder="Label" value={property.key} onChange={event => updateProperty(index, { key: event.target.value })}/><input className="form-input" placeholder="Value" value={property.value} onChange={event => updateProperty(index, { value: event.target.value })}/><button type="button" className="btn btn-danger btn-sm" onClick={() => update('customProperties', form.customProperties.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div><button type="button" className="btn btn-secondary btn-sm" onClick={() => update('customProperties', [...form.customProperties, { key: '', value: '', type: 'text' }])}>Add property</button></section>
    {error && <p className="form-error">{error}</p>}<div className="editor-actions"><button type="button" className="btn btn-secondary" onClick={() => router.back()}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Create product'}</button></div>
  </form>;
}
