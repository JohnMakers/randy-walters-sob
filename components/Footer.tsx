// components/Footer.tsx
'use client';

import React from 'react';

export default function Footer() {
  const handleMerchClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("Merch store is currently being updated. Check back soon!");
  };

  return (
    <footer className="w-full snap-start bg-black border-t-8 border-[var(--color-groove-gold)] py-12 px-6 relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      
      {/* Subtle Background Texture */}
      <div 
        className="absolute inset-0 z-0 opacity-10 mix-blend-luminosity pointer-events-none"
        style={{ backgroundImage: "url('/randy-sob-desktop.png')", backgroundSize: 'cover', backgroundPosition: 'center bottom' }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
        
        {/* Footer Header */}
        <h2 className="text-3xl md:text-4xl font-black text-[var(--color-groove-gold)] uppercase tracking-tighter mb-8 glitch-text text-center drop-shadow-lg">
          Follow The Official Afroman
        </h2>

        {/* Social Icons Grid */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10">
          
          {/* Facebook */}
          <a href="http://www.facebook.com/ogafroman" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] flex items-center justify-center rounded group-hover:bg-[var(--color-groove-gold)] group-hover:border-white transition-all transform group-hover:-translate-y-1 shadow-[4px_4px_0_var(--color-groove-red)]">
              <svg className="w-8 h-8 text-[var(--color-groove-gold)] group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Facebook</span>
          </a>

          {/* Instagram */}
          <a href="http://www.instagram.com/ogafroman" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] flex items-center justify-center rounded group-hover:bg-[var(--color-groove-gold)] group-hover:border-white transition-all transform group-hover:-translate-y-1 shadow-[4px_4px_0_var(--color-groove-red)]">
              <svg className="w-8 h-8 text-[var(--color-groove-gold)] group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Instagram</span>
          </a>

          {/* Twitter / X */}
          <a href="http://www.twitter.com/ogafroman" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] flex items-center justify-center rounded group-hover:bg-[var(--color-groove-gold)] group-hover:border-white transition-all transform group-hover:-translate-y-1 shadow-[4px_4px_0_var(--color-groove-red)]">
              <svg className="w-8 h-8 text-[var(--color-groove-gold)] group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">Twitter (X)</span>
          </a>

          {/* TikTok */}
          <a href="http://www.tiktok.com/@ogafroman" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] flex items-center justify-center rounded group-hover:bg-[var(--color-groove-gold)] group-hover:border-white transition-all transform group-hover:-translate-y-1 shadow-[4px_4px_0_var(--color-groove-red)]">
              <svg className="w-8 h-8 text-[var(--color-groove-gold)] group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.61-5.46-.04-1.45.28-2.88.92-4.14 1.05-1.92 2.95-3.35 5.09-3.67 1.15-.15 2.32-.05 3.42.29v4.13c-.31-.13-.64-.2-.97-.24-.95-.11-1.92.14-2.73.69-.96.65-1.57 1.74-1.59 2.89-.01 1.25.68 2.44 1.77 3.02 1.11.55 2.47.45 3.47-.23.83-.55 1.34-1.51 1.4-2.52.09-3.16.03-6.32.06-9.48z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">TikTok</span>
          </a>

        </div>

        {/* Action Links (Tour & Merch) */}
        <div className="flex flex-col md:flex-row gap-4 w-full max-w-lg mb-10">
          <a 
            href="https://www.ogafroman.com/tour" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 bg-[var(--color-groove-red)] hover:bg-[var(--color-groove-gold)] hover:text-black text-white text-center font-black uppercase tracking-widest py-4 border-2 border-transparent hover:border-white transition-all shadow-[6px_6px_0_rgba(255,255,255,0.1)] hover:shadow-[6px_6px_0_var(--color-groove-red)] flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Tour Dates
          </a>
          
          <a 
            href="#" 
            onClick={handleMerchClick}
            className="flex-1 bg-black text-[var(--color-groove-gold)] text-center font-black uppercase tracking-widest py-4 border-2 border-[var(--color-groove-gold)] hover:bg-[var(--color-groove-green-light)] hover:text-white transition-all shadow-[6px_6px_0_rgba(212,175,55,0.2)] hover:shadow-[6px_6px_0_var(--color-groove-gold)] flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            Merch (Soon)
          </a>
        </div>

        {/* Legal / Copyright */}
        <div className="w-full border-t-2 border-[var(--color-groove-green-dark)] pt-6 text-center">
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
            © {new Date().getFullYear()} OGAFROman. All Rights Reserved.
          </p>
          <p className="text-[var(--color-groove-red)] font-bold text-[10px] uppercase tracking-widest mt-2">
            This site is for documentary and evidentiary purposes only.
          </p>
        </div>

      </div>
    </footer>
  );
}