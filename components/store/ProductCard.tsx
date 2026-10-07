'use client';
import Link from 'next/link';
import { ArrowUpRight, Check, Plus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartProvider';
import { calculateProductPrice, getReferencePrice } from '@/lib/pricing';
import { storefrontPath } from '@/lib/storefront-paths';
import { formatMoney } from '@/lib/currency';
import { ensureCustomerLogin } from '@/components/store/ensureCustomerLogin';
type Product = { id: string; name: string; price: number; comparePrice: number; thumbnail: string; images: string[]; discount: number; stock: number; variants?: { name: string; options: string[]; priceModifier: number }[] };
export default function ProductCard({ product, slug }: { product: Product; slug: string }) {
  const image = product.thumbnail || product.images?.[0]; const { buyNow, currency } = useCart(); const router = useRouter(); const hasOptions = Boolean(product.variants?.length); const salePrice = calculateProductPrice(product.price, product.discount); const referencePrice = getReferencePrice(product.price, product.comparePrice, product.discount);
  const [buying, setBuying] = useState(false);
  const quickBuy = async () => {
    if (buying) return;
    setBuying(true);
    buyNow({ productId: product.id, productName: product.name, thumbnail: image || '', price: salePrice, originalPrice: product.price, qty: 1, selectedVariants: {} });
    const checkoutPath = storefrontPath(slug, 'checkout');
    const ok = await ensureCustomerLogin(slug, checkoutPath);
    if (ok) router.push(checkoutPath);
    else setBuying(false);
  };
  return <article className="product-card">
    {product.discount > 0 && <span className="product-discount-badge">-{product.discount}%</span>}
    <Link href={storefrontPath(slug, `products/${product.id}`)} className="product-card-link">
      <div className="product-card-media">
        {image ? <img className="product-card-img" src={image} alt={product.name} loading="lazy" decoding="async"/> : <div className="product-card-img-placeholder">No image</div>}
        <span className="product-card-visual-action">View product <ArrowUpRight size={15}/></span>
      </div>
      <div className="product-card-body">
        <span className="product-card-kicker">Collection pick</span>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price"><span className="product-price-current">{formatMoney(salePrice, currency)}</span>{referencePrice > salePrice && <span className="product-price-compare">{formatMoney(referencePrice, currency)}</span>}</div>
      </div>
    </Link>
    <div className="product-card-footer">{product.stock < 1 ? <span className="stock-note sold-out">Sold out</span> : hasOptions ? <Link href={storefrontPath(slug, `products/${product.id}`)} className="quick-add-btn"><SlidersHorizontal size={15}/> Choose options</Link> : <button className="quick-add-btn" disabled={buying} onClick={() => void quickBuy()}><Check size={16}/> {buying ? 'Please wait…' : 'Buy now'}</button>}</div>
  </article>;
}
