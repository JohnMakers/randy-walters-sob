// components/PeoplesWall.tsx
'use client';

import React, { useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';

const extractYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function PeoplesWall({ videos }: { videos: any[] }) {
  const [activeVideo, setActiveVideo] = useState<any | null>(null);

  if (!videos || videos.length === 0) return null;

  return (
    <section className="w-full snap-start min-h-screen py-20 px-4 md:px-12 border-b-8 border-[var(--color-groove-gold)] relative">
      <div className="w-full max-w-7xl mx-auto flex flex-col">
        
        {/* TITLE WRAPPER - Locked in place, z-10 prevents grid collision */}
        <div className="mb-12 border-b-8 border-[var(--color-groove-red)] w-max max-w-full pb-2 relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[var(--color-groove-gold)] tracking-tighter uppercase drop-shadow-md glitch-text bg-black/60 p-2 md:p-4 backdrop-blur-sm">
            The People's Wall
          </h2>
        </div>

        {/* THE GRID - Up to 6 columns to shrink cards and fit the 12-pack gracefully */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 relative z-0">
          {videos.map((video) => {
            const ytId = video.youtube_url ? extractYouTubeID(video.youtube_url) : null;

            return (
              <div 
                key={video.id}
                className="group relative aspect-[9/16] bg-black cursor-pointer border-4 border-black hover:border-[var(--color-groove-gold)] transition-all shadow-[6px_6px_0_rgba(0,0,0,0.8)] hover:shadow-[8px_8px_0_var(--color-groove-red)] transform hover:-translate-y-2 grayscale hover:grayscale-0 overflow-hidden"
                onClick={() => {
                  if (!video.mux_playback_id?.startsWith('processing')) {
                    setActiveVideo(video);
                  }
                }}
              >
                {video.youtube_url && ytId ? (
                  <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={video.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                ) : video.mux_playback_id?.startsWith('processing') ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-center p-4">
                    <p className="text-[var(--color-groove-gold)] font-bold text-sm">Processing...</p>
                  </div>
                ) : video.mux_playback_id ? (
                  <>
                    <img src={`https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?time=1`} alt={video.title} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0" loading="lazy" />
                    <img src={`https://image.mux.com/${video.mux_playback_id}/animated.webp`} alt={`${video.title} preview`} className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" loading="lazy" />
                  </>
                ) : null}
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/90 p-3 border-t-2 border-[var(--color-groove-gold)]">
                  <p className="text-[var(--color-groove-gold)] font-black uppercase text-xs md:text-sm truncate tracking-widest">{video.title}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL WRAPPER */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-4xl aspect-video bg-black border-4 border-[var(--color-groove-gold)] shadow-[20px_20px_0_var(--color-groove-red)]">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute -top-6 -right-6 z-10 bg-black text-[var(--color-groove-red)] w-12 h-12 border-4 border-[var(--color-groove-red)] font-black text-2xl hover:bg-[var(--color-groove-red)] hover:text-black transition-all shadow-[4px_4px_0_rgba(255,255,255,0.2)]"
            >
              X
            </button>
            
            {activeVideo.youtube_url ? (
              <iframe className="w-full h-full object-cover" src={`https://www.youtube.com/embed/${extractYouTubeID(activeVideo.youtube_url)}?autoplay=1&rel=0&modestbranding=1`} title={activeVideo.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <MuxPlayer playbackId={activeVideo.mux_playback_id} autoPlay streamType="on-demand" primaryColor="#D4AF37" secondaryColor="#081C15" className="w-full h-full" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}