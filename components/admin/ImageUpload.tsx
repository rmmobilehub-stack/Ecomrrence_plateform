'use client';

import { ImagePlus, LoaderCircle, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

export default function ImageUpload({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null); const [uploading, setUploading] = useState(false); const [error, setError] = useState('');
  const upload = async (files: FileList | null) => {
    if (!files?.length) return; setError(''); setUploading(true);
    const formData = new FormData(); Array.from(files).forEach(file => formData.append('files', file));
    try { const response = await fetch('/api/upload', { method: 'POST', body: formData }); const data = await response.json(); if (!response.ok) throw new Error(data.error ?? 'Upload failed'); onChange([...images, ...(data.urls ?? [])]); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : 'Upload failed'); }
    finally { setUploading(false); if (input.current) input.current.value = ''; }
  };
  return <div><input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple hidden onChange={event => void upload(event.target.files)}/><div className="image-upload-grid">{images.map((url, index) => <div className="upload-preview" key={`${url}-${index}`}><img src={url} alt={`Product image ${index + 1}`}/><button type="button" aria-label="Remove image" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={15}/></button>{index === 0 && <span>Cover</span>}</div>)}<button type="button" className="upload-zone compact-upload" disabled={uploading} onClick={() => input.current?.click()}>{uploading ? <LoaderCircle className="spin"/> : <ImagePlus/>}<strong>{uploading ? 'Uploading…' : 'Upload images'}</strong><small>JPG, PNG, WEBP or GIF · 5 MB each</small></button></div>{error && <p className="form-error mt-2">{error}</p>}</div>;
}
