'use client';

import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/store/ProductCard';
import Reveal from '@/components/store/Reveal';
import Pagination from '@/components/ui/Pagination';

type Product = {
  id: string;
  name: string;
  price: number;
  comparePrice: number;
  thumbnail: string;
  images: string[];
  discount: number;
  stock: number;
  variants: { name: string; options: string[]; priceModifier: number }[];
};

type Category = { id: string; name: string };

export default function ProductsPage({ params }: { params: { storeSlug: string } }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ search, sortBy: sort });
      if (category) query.set('categoryId', category);
      fetch(`/api/store/${params.storeSlug}/products?${query}`, { signal: controller.signal })
        .then((response) => response.json())
        .then((data) => {
          setProducts(data.products ?? []);
          setCategories(data.categories ?? []);
          setPage(1);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') console.error(error);
        });
    }, 180);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [params.storeSlug, search, category, sort]);

  const pageCount = Math.ceil(products.length / perPage);
  const visible = products.slice((page - 1) * perPage, page * perPage);

  return (
    <main className="store-section shop-page">
      <Reveal className="page-header catalog-heading">
        <div>
          <p className="eyebrow home-section-kicker">Apple-compatible accessories</p>
          <h1 className="page-title title-with-underline">
            Chargers, cables and <span className="section-title-accent text-accent-glow">more</span>
          </h1>
          <p className="page-subtitle">Find the right power accessory for your everyday setup.</p>
        </div>
        <span className="catalog-count">
          {products.length} product{products.length === 1 ? '' : 's'}
        </span>
      </Reveal>

      <Reveal className="catalog-filter" delay={80}>
        <div className="catalog-search">
          <Search size={18} />
          <input
            className="form-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chargers and accessories"
            aria-label="Search chargers and accessories"
          />
        </div>
        <div className="catalog-filter-select">
          <SlidersHorizontal size={17} />
          <select
            className="form-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option value={item.id} key={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <select
          className="form-select"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort products"
        >
          <option value="newest">Newest arrivals</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </Reveal>

      {visible.length ? (
        <>
          <div className="products-grid shop-products-grid">
            {visible.map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index * 45, 220)} className="shop-product-card">
                <ProductCard product={product} slug={params.storeSlug} />
              </Reveal>
            ))}
          </div>
          <Reveal delay={60}>
            <Pagination page={page} pageCount={pageCount} onChange={setPage} />
          </Reveal>
        </>
      ) : (
        <Reveal className="empty-state shop-empty-state">
          No accessories match your search.
        </Reveal>
      )}
    </main>
  );
}
