'use client';

import Link from 'next/link';
import { Home, Info, Menu, ShoppingBag, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { storefrontPath } from '@/lib/storefront-paths';

type StoreNavProps = {
  slug: string;
  homeHref: string;
  name: string;
  logo?: string;
  announcement?: string;
};

export default function StoreNav({ slug, homeHref, name, logo, announcement }: StoreNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const repairHref = storefrontPath(slug, 'repair');
  const shopHref = storefrontPath(slug, 'products');
  const aboutHref = `${homeHref}#about`;
  const assurance = announcement || 'Cash on delivery';

  return (
    <nav className="store-navbar">
      <Link href={homeHref} className="store-nav-logo" onClick={closeMenu}>
        {logo ? (
          <span className="store-logo-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="store-logo-image" src={logo} alt={`${name} logo`} />
          </span>
        ) : (
          <span className="store-rm-mark" aria-label={`${name} logo`} role="img">
            RM
          </span>
        )}
        <span className="store-nav-name">{name}</span>
      </Link>

      <div className="store-nav-links">
        <Link className="store-nav-link" href={homeHref}>Home</Link>
        <Link className="store-nav-link" href={shopHref}>Shop</Link>
        <Link className="store-nav-link" href={repairHref}>iPhone Repair</Link>
        <Link className="store-nav-link" href={aboutHref}>About</Link>
        <span className="nav-assurance">{assurance}</span>
      </div>

      <div className="store-nav-actions">
        <button
          className={`store-mobile-menu-btn ${menuOpen ? 'active' : ''}`}
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          aria-controls="store-mobile-menu"
        >
          {menuOpen ? <X size={19} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen ? (
        <>
          <button
            className="store-mobile-menu-backdrop"
            type="button"
            aria-label="Close navigation"
            onClick={closeMenu}
          />
          <div className="store-mobile-menu" id="store-mobile-menu">
            <Link href={homeHref} onClick={closeMenu}>
              <Home size={18} />
              <span>Home<small>Back to the storefront</small></span>
            </Link>
            <Link href={shopHref} onClick={closeMenu}>
              <ShoppingBag size={18} />
              <span>Shop<small>Browse all products</small></span>
            </Link>
            <Link href={repairHref} onClick={closeMenu}>
              <Wrench size={18} />
              <span>iPhone Repair<small>Doorstep repair booking</small></span>
            </Link>
            <Link href={aboutHref} onClick={closeMenu}>
              <Info size={18} />
              <span>About<small>Learn about {name}</small></span>
            </Link>
            <div className="store-mobile-assurance">
              <span />
              <strong>{assurance}</strong>
            </div>
          </div>
        </>
      ) : null}
    </nav>
  );
}
