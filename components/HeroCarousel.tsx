// components/HeroCarousel.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import MuxPlayer from '@mux/mux-player-react';

const extractYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function HeroCarousel({ videos }: { videos: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi]);

  if (!videos || videos.length === 0) {
    return (
      <section className="relative w-full h-screen snap-start flex flex-col items-center justify-center text-center p-4 border-b-8 border-[var(--color-groove-gold)] bg-black/40 backdrop-blur-sm overflow-hidden">
        <div className="relative z-10 w-full max-w-3xl">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[var(--color-groove-gold)] tracking-tighter uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] glitch-text leading-none">
            Randy Walters is a SOB!
          </h1>
          <div className="mt-8 p-6 border-4 border-[var(--color-groove-gold)] border-dashed rounded bg-black/80 text-[var(--color-groove-red)] text-xl font-bold uppercase tracking-widest shadow-[8px_8px_0_var(--color-groove-red)]">
            The stage is empty. The vault is locked. Use the Snitch Box below.
          </div>
        </div>
      </section>
    );
  }

  return (
    // Enforced h-screen and overflow-hidden to kill the rogue scrollbar
    <section className="relative w-full h-screen snap-start flex flex-col items-center justify-center p-4 md:p-8 border-b-8 border-[var(--color-groove-gold)] bg-black/40 backdrop-blur-sm overflow-hidden">
      
      {/* Tightened max-w to 4xl so the aspect-video doesn't get too tall */}
      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center gap-4 md:gap-6">
        
        <div className="w-full text-center">
          {/* Scaled text sizes slightly to fit tighter vertical viewports */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-[var(--color-groove-gold)] tracking-tighter uppercase drop-shadow-[0_8px_8px_rgba(0,0,0,0.9)] glitch-text leading-none">
            Randy Walters is a SOB!
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-groove-red)] font-bold mt-4 uppercase tracking-widest inline-block p-2 px-4 bg-black border-2 border-[var(--color-groove-green-light)] rounded shadow-[4px_4px_0_var(--color-groove-red)]">
            The People's Hall of Infamy
          </p>
        </div>

        {/* Added margin-bottom (mb-8) to account for the absolute positioning of the dots */}
        <div className="w-full relative group shadow-[15px_15px_0_rgba(0,0,0,0.9)] mb-8">
          <div 
            className="overflow-hidden border-4 border-[var(--color-groove-gold)] bg-black aspect-video w-full" 
            ref={emblaRef}
          >
            <div className="flex h-full">
              {videos.map((video) => (
                <div className="flex-[0_0_100%] min-w-0 relative h-full" key={video.id}>
                  {video.youtube_url ? (
                    <iframe className="w-full h-full object-cover" src={`https://www.youtube.com/embed/${extractYouTubeID(video.youtube_url)}?rel=0&modestbranding=1`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  ) : video.mux_playback_id?.startsWith('processing') ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-[var(--color-groove-gold)] font-bold text-center p-4"> Video Processing... </div>
                  ) : (
                    <MuxPlayer playbackId={video.mux_playback_id} metadata={{ video_title: video.title }} streamType="on-demand" primaryColor="#D4AF37" secondaryColor="#081C15" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {videos.length > 1 && (
            <>
              <button onClick={scrollPrev} className="absolute left-0 md:-left-6 top-1/2 -translate-y-1/2 bg-black hover:bg-[var(--color-groove-green)] text-white p-3 md:p-5 rounded-none border-4 border-[var(--color-groove-gold)] transition-all active:scale-95 z-20 shadow-[4px_4px_0_var(--color-groove-green-light)] font-bold"> &#8592; </button>
              <button onClick={scrollNext} className="absolute right-0 md:-right-6 top-1/2 -translate-y-1/2 bg-black hover:bg-[var(--color-groove-green)] text-white p-3 md:p-5 rounded-none border-4 border-[var(--color-groove-gold)] transition-all active:scale-95 z-20 shadow-[4px_4px_0_var(--color-groove-green-light)] font-bold"> &#8594; </button>
              <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-4 z-10">
                {videos.map((_, index) => (
                  <button key={index} onClick={() => scrollTo(index)} className={`w-3 h-3 md:w-4 md:h-4 rounded-none transition-all border-2 border-[var(--color-groove-gold)] shadow-md ${ index === selectedIndex ? 'bg-[var(--color-groove-red)] scale-125' : 'bg-black hover:bg-[var(--color-groove-green-light)]' }`} aria-label={`Go to slide ${index + 1}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}