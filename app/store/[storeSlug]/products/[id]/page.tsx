import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { readDb } from '@/lib/db';
import type { Category, Product, Store } from '@/lib/types';
import AddToCart from '@/components/store/AddToCart';
import ImageGallery from '@/components/store/ImageGallery';
import ProductCard from '@/components/store/ProductCard';
import { calculateProductPrice, getReferencePrice } from '@/lib/pricing';
import { storefrontPath } from '@/lib/storefront-paths';

export async function generateMetadata({ params }: { params: { storeSlug: string; id: string } }): Promise<Metadata> {
  const [stores, products] = await Promise.all([readDb<Store>('stores'), readDb<Product>('products')]);
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive);
  const product = products.find(entry => entry.id === params.id && entry.storeId === store?.id && entry.status === 'active');
  if (!store || !product) return { title: 'Product not found', robots: { index: false, follow: false } };
  const description = product.description || `Buy ${product.name} from ${store.name}. Cash on delivery available.`;
  const image = product.images?.find(Boolean) || product.thumbnail || store.banner;
  const productUrl = storefrontPath(store.slug, `products/${product.id}`);
  return { title: { absolute: `${product.name} | ${store.name}` }, description, alternates: { canonical: productUrl }, openGraph: { title: product.name, description, url: productUrl, type: 'website', images: image ? [{ url: image, alt: product.name }] : [] } };
}

export default async function ProductPage({ params }: { params: { storeSlug: string; id: string } }) {
  const [stores, products, categories] = await Promise.all([readDb<Store>('stores'), readDb<Product>('products'), readDb<Category>('categories')]);
  const store = stores.find(entry => entry.slug === params.storeSlug && entry.isActive);
  const product = products.find(entry => entry.id === params.id && entry.storeId === store?.id && entry.status === 'active');
  if (!store || !product) notFound();

  const images = (product.images ?? []).filter(Boolean);
  const properties = product.customProperties ?? [];
  const categoryName = categories.find(category => category.id === product.categoryId)?.name ?? 'Uncategorised';
  const productTags = new Set((product.tags ?? []).map(tag => tag.toLowerCase()));
  const related = products.filter(entry => entry.storeId === store.id && entry.status === 'active' && entry.id !== product.id).map(entry => {
    const sharedTags = (entry.tags ?? []).filter(tag => productTags.has(tag.toLowerCase())).length;
    return { entry, score: (entry.categoryId === product.categoryId ? 10 : 0) + sharedTags };
  }).sort((a, b) => b.score - a.score || new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime()).slice(0, 4).map(item => item.entry);
  const salePrice = calculateProductPrice(product.price, product.discount);
  const referencePrice = getReferencePrice(product.price, product.comparePrice, product.discount);

  return <main className="store-section"><div className="product-detail"><div><ImageGallery images={images} alt={product.name}/></div><div className="product-info"><p className="eyebrow">{categoryName} · {store.name}</p><h1>{product.name}</h1><div className="product-detail-price">${salePrice.toFixed(2)} {referencePrice > salePrice && <del>${referencePrice.toFixed(2)}</del>}</div>{product.discount > 0 && <span className="product-discount-badge detail-discount">Save {product.discount}%</span>}<p className="product-description">{product.description}</p><AddToCart product={product} storeSlug={store.slug} storeName={store.name} whatsappNumber={store.whatsappNumber}/><div className="product-facts"><span><strong>SKU</strong>{product.sku || '—'}</span><span><strong>Category</strong>{categoryName}</span><span><strong>Availability</strong><b className={product.stock > 0 ? 'text-success' : 'text-error'}>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</b></span></div>{product.tags?.length > 0 && <div className="product-tags">{product.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}{properties.length > 0 && <section className="product-details-section"><h2>Product details</h2><dl className="properties">{properties.map((property, index) => <div key={`${property.key}-${index}`}><dt>{property.key}</dt><dd>{property.value}</dd></div>)}</dl></section>}<div className="product-assurance"><div><strong>Cash on delivery</strong><span>Pay securely when your order arrives.</span></div><div><strong>Quick dispatch</strong><span>We will contact you to confirm delivery.</span></div></div></div></div><section className="related-products"><div className="section-heading"><div><p className="eyebrow">YOU MAY ALSO LIKE</p><h2>Related products</h2><p className="text-secondary">More picks from {store.name} in the same collection.</p></div></div>{related.length > 0 ? <div className="products-grid">{related.map(item => <ProductCard key={item.id} product={item} slug={store.slug}/>)}</div> : <p className="empty-state">More products will appear here soon.</p>}</section></main>;
}
