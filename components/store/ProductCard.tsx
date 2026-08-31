'use client';
import Link from 'next/link';
import { ArrowUpRight, Check, Plus, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { calculateProductPrice, getReferencePrice } from '@/lib/pricing';
import { storefrontPath } from '@/lib/storefront-paths';
type Product = { id: string; name: string; price: number; comparePrice: number; thumbnail: string; images: string[]; discount: number; stock: number; variants?: { name: string; options: string[]; priceModifier: number }[] };
export default function ProductCard({ product, slug }: { product: Product; slug: string }) {
  const image = product.thumbnail || product.images?.[0]; const { add } = useCart(); const [added, setAdded] = useState(false); const hasOptions = Boolean(product.variants?.length); const salePrice = calculateProductPrice(product.price, product.discount); const referencePrice = getReferencePrice(product.price, product.comparePrice, product.discount);
  const quickAdd = () => { add({ productId: product.id, productName: product.name, thumbnail: image || '', price: salePrice, originalPrice: product.price, qty: 1, selectedVariants: {} }); setAdded(true); window.setTimeout(() => setAdded(false), 1500); };
  return <article className="product-card">
    {product.discount > 0 && <span className="product-discount-badge">-{product.discount}%</span>}
    <Link href={storefrontPath(slug, `products/${product.id}`)} className="product-card-link">
      <div className="product-card-media">
        {image ? <img className="product-card-img" src={image} alt={product.name}/> : <div className="product-card-img-placeholder">No image</div>}
        <span className="product-card-visual-action">View product <ArrowUpRight size={15}/></span>
      </div>
      <div className="product-card-body">
        <span className="product-card-kicker">Collection pick</span>
        <h3 className="product-card-name">{product.name}</h3>
        <div className="product-card-price"><span className="product-price-current">${salePrice.toFixed(2)}</span>{referencePrice > salePrice && <span className="product-price-compare">${referencePrice.toFixed(2)}</span>}</div>
      </div>
    </Link>
    <div className="product-card-footer">{product.stock < 1 ? <span className="stock-note sold-out">Sold out</span> : hasOptions ? <Link href={storefrontPath(slug, `products/${product.id}`)} className="quick-add-btn"><SlidersHorizontal size={15}/> Choose options</Link> : <button className={`quick-add-btn ${added ? 'added' : ''}`} onClick={quickAdd}>{added ? <><Check size={16}/> Added</> : <><Plus size={16}/> Add to cart</>}</button>}</div>
  </article>;
}
