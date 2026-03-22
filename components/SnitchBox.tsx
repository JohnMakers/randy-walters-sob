// components/SnitchBox.tsx
'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import ReCAPTCHA from 'react-google-recaptcha';

export default function SnitchBox() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    // Gate the upload behind the file, title, AND a valid captcha token
    if (!file || !title || !captchaToken) return;
    setStatus('uploading');

    try {
      const response = await fetch('/api/upload', { method: 'POST' });
      const { url, id: muxUploadId } = await response.json();
      if (!url) throw new Error('No upload URL returned');

      await fetch(url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

      const { error: dbError } = await supabase.from('videos').insert([
        { title, mux_asset_id: muxUploadId, mux_playback_id: `processing_${muxUploadId}`, status: 'pending' }
      ]);

      if (dbError) throw dbError;

      setStatus('success');
      setTitle('');
      setFile(null);
      // Reset the CAPTCHA requirement after a successful submission
      setCaptchaToken(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error) {
      console.error('Upload Error:', error);
      setStatus('error');
    }
  };

  return (
    <section className="w-full snap-start min-h-screen flex items-center justify-center py-16 px-4">
      <div className="bg-black w-full max-w-3xl border-4 border-[var(--color-groove-gold)] p-8 md:p-12 shadow-[15px_15px_0_var(--color-groove-green-light)] relative">
        
        {/* Caution Tape Accent */}
        <div className="absolute top-0 left-0 w-full h-4 bg-[repeating-linear-gradient(45deg,var(--color-groove-gold),var(--color-groove-gold)_10px,black_10px,black_20px)] border-b-4 border-black"></div>

        {/* HEADER BLOCK - Fixed the collision by using flex-col and gap-4 */}
        <div className="flex flex-col items-center text-center mb-10 mt-4 relative z-10 gap-4">
          <h2 className="text-4xl md:text-5xl font-black text-[var(--color-groove-red)] uppercase tracking-wide glitch-text drop-shadow-[2px_2px_0_rgba(255,255,255,0.2)]">
            Want to call Randy a bitch with us?
          </h2>
          <p className="text-[var(--color-groove-gold)] font-bold bg-[var(--color-groove-green-dark)] border border-[var(--color-groove-green-light)] px-4 py-2 uppercase tracking-widest text-sm text-center">
            Submit your video now!
          </p>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-6 relative z-10">
          <div>
            <label className="block text-[var(--color-groove-green-light)] font-black mb-2 uppercase text-sm tracking-widest">
              Title
            </label>
            <input 
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)} disabled={status === 'uploading'}
              className="w-full bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] rounded-none p-4 text-[var(--color-groove-gold)] font-bold focus:border-[var(--color-groove-gold)] focus:bg-black outline-none transition-colors"
              placeholder="ENTER TITLE..."
            />
          </div>

          <div>
            <label className="block text-[var(--color-groove-green-light)] font-black mb-2 uppercase text-sm tracking-widest">
              Upload your video
            </label>
            <input 
              type="file" accept="video/*" required ref={fileInputRef} onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={status === 'uploading'}
              className="w-full bg-black border-2 border-dashed border-[var(--color-groove-red)] p-6 text-gray-400 file:mr-6 file:py-3 file:px-6 file:rounded-none file:border-0 file:text-sm file:font-black file:uppercase file:bg-[var(--color-groove-red)] file:text-white hover:file:bg-[var(--color-groove-gold)] hover:file:text-black transition-all cursor-pointer"
            />
          </div>

          {/* CAPTCHA Widget */}
          <div className="flex justify-center mt-2 overflow-hidden rounded">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"}
              onChange={(token) => setCaptchaToken(token)}
              theme="dark"
            />
          </div>

          <button 
            type="submit" 
            disabled={status === 'uploading' || !file || !title || !captchaToken}
            className="mt-4 w-full bg-[var(--color-groove-gold)] hover:bg-white text-black font-black text-2xl uppercase py-5 rounded-none border-b-8 border-black active:border-b-0 active:translate-y-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_var(--color-groove-red)]"
          >
            {status === 'uploading' ? 'Transmitting...' : 'Submit'}
          </button>

          {status === 'success' && (
            <div className="bg-[var(--color-groove-green-dark)] border-l-8 border-[var(--color-groove-gold)] p-4 text-[var(--color-groove-gold)] font-black uppercase text-center tracking-widest mt-4">
              Upload Confirmed. Awaiting Admin Clearance.
            </div>
          )}
          
          {status === 'error' && (
            <div className="bg-black border-2 border-[var(--color-groove-red)] p-4 text-[var(--color-groove-red)] font-black uppercase text-center tracking-widest mt-4 glitch-text">
              Signal Lost. Retry Upload.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}