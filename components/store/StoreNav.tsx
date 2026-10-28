'use client';

import Link from 'next/link';
import { Activity, Download, Home, Info, LogIn, Menu, ShoppingBag, UserRound, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { storefrontPath } from '@/lib/storefront-paths';
import CustomerAccountMenu, { type CustomerBrief } from '@/components/store/CustomerAccountMenu';

type StoreNavProps = {
  slug: string;
  storeId?: string;
  homeHref: string;
  name: string;
  logo?: string;
  announcement?: string;
  initialCustomer?: CustomerBrief | null;
  androidDownloadUrl?: string;
};

export default function StoreNav({
  slug,
  storeId,
  homeHref,
  name,
  logo,
  announcement,
  initialCustomer = null,
  androidDownloadUrl,
}: StoreNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const repairHref = storefrontPath(slug, 'repair');
  const phoneCheckHref = storefrontPath(slug, 'phone-check');
  const shopHref = storefrontPath(slug, 'products');
  const accountHref = storefrontPath(slug, 'account');
  const loginHref = storefrontPath(slug, 'account/login');
  const aboutHref = `${homeHref}#about`;
  const assurance = announcement || 'Cash on delivery';
  const isLoggedIn = Boolean(initialCustomer);

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
        <Link className="store-nav-link" href={homeHref}>
          Home
        </Link>
        <Link className="store-nav-link" href={shopHref}>
          Shop
        </Link>
        <Link className="store-nav-link" href={repairHref}>
          iPhone Repair
        </Link>
        <Link className="store-nav-link" href={phoneCheckHref}>
          Phone Check
        </Link>
        <Link className="store-nav-link" href={aboutHref}>
          About
        </Link>
        {androidDownloadUrl ? <a className="store-nav-link" href={androidDownloadUrl} download="RMMobile-latest.apk">Download app</a> : null}
        <span className="nav-assurance">{assurance}</span>
      </div>

      <div className="store-nav-actions">
        <CustomerAccountMenu slug={slug} storeId={storeId} initialCustomer={initialCustomer} />
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
              <span>
                Home<small>Back to the storefront</small>
              </span>
            </Link>
            <Link href={shopHref} onClick={closeMenu}>
              <ShoppingBag size={18} />
              <span>
                Shop<small>Browse all products</small>
              </span>
            </Link>
            <Link href={repairHref} onClick={closeMenu}>
              <Wrench size={18} />
              <span>
                iPhone Repair<small>Doorstep repair booking</small>
              </span>
            </Link>
            <Link href={phoneCheckHref} onClick={closeMenu}>
              <Activity size={18} />
              <span>
                Phone Check<small>Score, worth & suggestions</small>
              </span>
            </Link>
            <Link href={aboutHref} onClick={closeMenu}>
              <Info size={18} />
              <span>
                About<small>Learn about {name}</small>
              </span>
            </Link>
            {androidDownloadUrl ? (
              <a href={androidDownloadUrl} download="RMMobile-latest.apk" onClick={closeMenu}>
                <Download size={18} />
                <span>Download Android app<small>Get the APK for your phone</small></span>
              </a>
            ) : null}
            {isLoggedIn ? (
              <Link href={accountHref} onClick={closeMenu}>
                <UserRound size={18} />
                <span>
                  My account<small>Orders & repair history</small>
                </span>
              </Link>
            ) : (
              <Link href={loginHref} onClick={closeMenu}>
                <LogIn size={18} />
                <span>
                  Login<small>Track orders & repairs</small>
                </span>
              </Link>
            )}
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
