'use client';
type Props = { page: number; pageCount: number; onChange: (page: number) => void };
export default function Pagination({ page, pageCount, onChange }: Props) {
  if (pageCount < 2) return null;
  return <nav className="pagination" aria-label="Pagination"><button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>{Array.from({ length: pageCount }, (_, index) => <button className={`page-btn ${page === index + 1 ? 'active' : ''}`} key={index} onClick={() => onChange(index + 1)}>{index + 1}</button>)}<button className="page-btn" disabled={page === pageCount} onClick={() => onChange(page + 1)}>›</button></nav>;
}
