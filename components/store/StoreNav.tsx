'use client';
import Link from 'next/link';
import { Home, Info, Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartProvider';
import CartDrawer from './CartDrawer';
import BrandMark from '@/components/ui/BrandMark';
import { storefrontPath } from '@/lib/storefront-paths';

export default function StoreNav({ slug, homeHref, name, logo, announcement }: { slug: string; homeHref: string; name: string; logo: string; announcement?: string }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const closeMenu = () => setMenuOpen(false);

  return <>
    <nav className="store-navbar">
      <Link href={homeHref} className="store-nav-logo" onClick={closeMenu}>{logo ? <img src={logo} className="store-logo-image" alt=""/> : <BrandMark size={17} className="store-logo-mark"/>}{name}</Link>
      <div className="store-nav-links"><Link className="store-nav-link" href={homeHref}>Home</Link><Link className="store-nav-link" href={storefrontPath(slug, 'products')}>Shop</Link><Link className="store-nav-link" href={`${homeHref}#about`}>About</Link><span className="nav-assurance">{announcement || 'Cash on delivery'}</span></div>
      <div className="store-nav-actions">
        <button className={`store-mobile-menu-btn ${menuOpen ? 'active' : ''}`} type="button" onClick={() => setMenuOpen((current) => !current)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="store-mobile-menu">{menuOpen ? <X size={19}/> : <Menu size={20}/>}</button>
        <button className="cart-btn" type="button" onClick={() => { closeMenu(); setCartOpen(true); }} aria-label="Open cart"><ShoppingBag size={19}/>{count > 0 && <span className="cart-count">{count}</span>}</button>
      </div>
      {menuOpen && <>
        <button className="store-mobile-menu-backdrop" type="button" aria-label="Close navigation" onClick={closeMenu}/>
        <div className="store-mobile-menu" id="store-mobile-menu">
          <Link href={homeHref} onClick={closeMenu}><Home size={18}/><span>Home<small>Back to the storefront</small></span></Link>
          <Link href={storefrontPath(slug, 'products')} onClick={closeMenu}><ShoppingBag size={18}/><span>Shop<small>Browse all products</small></span></Link>
          <Link href={`${homeHref}#about`} onClick={closeMenu}><Info size={18}/><span>About<small>Learn about {name}</small></span></Link>
          <div className="store-mobile-assurance"><span/><strong>{announcement || 'Cash on delivery'}</strong></div>
        </div>
      </>}
    </nav>
    <CartDrawer slug={slug} open={cartOpen} onClose={() => setCartOpen(false)}/>
  </>;
}
