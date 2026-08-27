'use client';

import { useRef, useState } from 'react';
import { Search } from 'lucide-react';

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);
  const zoomRef = useRef<HTMLButtonElement>(null);
  const zoomed = hovered || locked;

  const updateZoomOrigin = (event: React.MouseEvent<HTMLButtonElement>) => {
    const element = zoomRef.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    element.style.setProperty('--zoom-x', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    element.style.setProperty('--zoom-y', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  };

  if (!images.length) return <div className="product-main-image image-placeholder">No image available</div>;
  const selectImage = (index: number) => { setSelected(index); setLocked(false); };

  return <div className="product-gallery"><button ref={zoomRef} type="button" className={`product-image-zoom ${zoomed ? 'zoomed' : ''}`} aria-label={zoomed ? 'Zoom out product image' : 'Zoom product image'} aria-pressed={locked} onClick={() => setLocked(value => !value)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onMouseMove={updateZoomOrigin}><img className="product-main-image" src={images[selected]} alt={alt} decoding="async"/><span className="image-zoom-hint"><Search size={16}/><span className="desktop-zoom-label">Hover to zoom</span><span className="touch-zoom-label">Tap to zoom</span></span></button>{images.length > 1 && <div className="thumbnail-row">{images.map((src, index) => <button type="button" key={src} className={selected === index ? 'selected' : ''} onClick={() => selectImage(index)}><img src={src} alt={`${alt} ${index + 1}`} loading="lazy" decoding="async"/></button>)}</div>}</div>;
}
