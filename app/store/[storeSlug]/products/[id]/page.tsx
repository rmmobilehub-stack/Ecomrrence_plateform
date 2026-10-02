import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getActiveProductById, getActiveProductsForStore, getActiveStoreBySlug, getCategoriesForStore } from '@/lib/db';
import AddToCart from '@/components/store/AddToCart';
import ImageGallery from '@/components/store/ImageGallery';
import ProductCard from '@/components/store/ProductCard';
import ProductPrice from '@/components/store/ProductPrice';
import Reveal from '@/components/store/Reveal';
import { calculateProductPrice, getReferencePrice } from '@/lib/pricing';
import { storefrontPath } from '@/lib/storefront-paths';

export async function generateMetadata({ params }: { params: { storeSlug: string; id: string } }): Promise<Metadata> {
  const store = await getActiveStoreBySlug(params.storeSlug);
  const product = store ? await getActiveProductById(store.id, params.id) : null;
  if (!store || !product) return { title: 'Product not found', robots: { index: false, follow: false } };
  const description = product.description || `Buy ${product.name} from ${store.name}. Cash on delivery available.`;
  const image = product.images?.find(Boolean) || product.thumbnail || store.banner;
  const productUrl = storefrontPath(store.slug, `products/${product.id}`);
  return {
    title: { absolute: `${product.name} | ${store.name}` },
    description,
    alternates: { canonical: productUrl },
    openGraph: {
      title: product.name,
      description,
      url: productUrl,
      type: 'website',
      images: image ? [{ url: image, alt: product.name }] : [],
    },
  };
}

function formatProductTitle(title: string): ReactNode {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) return title;
  const head = words.slice(0, -2).join(' ');
  const accent = words.slice(-2).join(' ');
  return <>{head} <span className="section-title-accent text-accent-glow">{accent}</span></>;
}

export default async function ProductPage({ params }: { params: { storeSlug: string; id: string } }) {
  const store = await getActiveStoreBySlug(params.storeSlug);
  if (!store) notFound();
  const [product, products, categories] = await Promise.all([
    getActiveProductById(store.id, params.id),
    getActiveProductsForStore(store.id),
    getCategoriesForStore(store.id),
  ]);
  if (!store || !product) notFound();

  const images = (product.images ?? []).filter(Boolean);
  const properties = product.customProperties ?? [];
  const categoryName = categories.find((category) => category.id === product.categoryId)?.name ?? 'Uncategorised';
  const productTags = new Set((product.tags ?? []).map((tag) => tag.toLowerCase()));
  const related = products
    .filter((entry) => entry.storeId === store.id && entry.status === 'active' && entry.id !== product.id)
    .map((entry) => {
      const sharedTags = (entry.tags ?? []).filter((tag) => productTags.has(tag.toLowerCase())).length;
      return { entry, score: (entry.categoryId === product.categoryId ? 10 : 0) + sharedTags };
    })
    .sort((a, b) => b.score - a.score || new Date(b.entry.createdAt).getTime() - new Date(a.entry.createdAt).getTime())
    .slice(0, 4)
    .map((item) => item.entry);
  const salePrice = calculateProductPrice(product.price, product.discount);
  const referencePrice = getReferencePrice(product.price, product.comparePrice, product.discount);
  const inStock = product.stock > 0;

  return (
    <main className="store-section product-page">
      <div className="product-detail">
        <Reveal className="product-gallery-panel">
          <ImageGallery images={images} alt={product.name} />
        </Reveal>

        <Reveal className="product-info" delay={80}>
          <div className="product-kicker-row">
            <p className="eyebrow product-eyebrow">{categoryName}</p>
            <span className={`product-stock-chip ${inStock ? 'is-in-stock' : 'is-out-of-stock'}`}>
              {inStock ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <h1 className="product-title title-with-underline">{formatProductTitle(product.name)}</h1>

          <div className="product-price-row">
            <ProductPrice
              price={salePrice}
              referencePrice={referencePrice}
              currency={store.currency}
              needsSelection={(product.variants ?? []).length > 0}
            />
            {product.discount > 0 && (
              <span className="product-discount-badge detail-discount">Save {product.discount}%</span>
            )}
          </div>

          {product.description && <p className="product-description">{product.description}</p>}

          <AddToCart
            product={product}
            storeSlug={store.slug}
            storeName={store.name}
            whatsappNumber={store.whatsappNumber}
          />

          <div className="product-facts">
            <span><strong>SKU</strong>{product.sku || '—'}</span>
            <span><strong>Category</strong>{categoryName}</span>
            <span>
              <strong>Availability</strong>
              <b className={inStock ? 'text-success' : 'text-error'}>
                {inStock ? `${product.stock} in stock` : 'Out of stock'}
              </b>
            </span>
          </div>

          {product.tags?.length > 0 && (
            <div className="product-tags">
              {product.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          )}

          {properties.length > 0 && (
            <section className="product-details-section">
              <h2 className="product-section-title">Product <span className="section-title-accent text-accent-glow">details</span></h2>
              <dl className="properties">
                {properties.map((property, index) => (
                  <div key={`${property.key}-${index}`}>
                    <dt>{property.key}</dt>
                    <dd>{property.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="product-assurance">
            <div>
              <strong>Cash on delivery</strong>
              <span>Pay securely when your order arrives.</span>
            </div>
            <div>
              <strong>Quick dispatch</strong>
              <span>We will contact you to confirm delivery.</span>
            </div>
          </div>
        </Reveal>
      </div>

      <section className="related-products">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow home-section-kicker">You may also like</p>
            <h2 className="title-with-underline">Related <span className="section-title-accent text-accent-glow">products</span></h2>
            <p className="text-secondary">More picks from {store.name} in the same collection.</p>
          </div>
        </Reveal>
        {related.length > 0
          ? <div className="products-grid">{related.map((item) => <ProductCard key={item.id} product={item} slug={store.slug} />)}</div>
          : <p className="empty-state">More products will appear here soon.</p>}
      </section>
    </main>
  );
}
