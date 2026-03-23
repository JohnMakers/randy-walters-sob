// app/page.tsx
import { supabase } from '../lib/supabase';
import HeroCarousel from '../components/HeroCarousel';
import PeoplesWall from '../components/PeoplesWall';
import SnitchBox from '../components/SnitchBox';
import Footer from '../components/Footer'; // 1. Import the new Footer

export const revalidate = 0; 

export default async function Home() {
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'public')
    .order('priority_order', { ascending: true }) 
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching videos:", error);

  const readyVideos = (videos || []).filter(video => {
    if (video.youtube_url) return true; 
    if (video.mux_playback_id && !video.mux_playback_id.startsWith('processing')) return true; 
    return false; 
  });
  
  const featuredVideos = readyVideos.filter(v => v.is_featured === true);
  const gridVideos = readyVideos.filter(v => v.is_featured !== true);

  return (
    <main className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory bg-[var(--color-groove-green-dark)] selection:bg-[var(--color-groove-red)] selection:text-white scroll-smooth">
      
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-20 mix-blend-luminosity"
        style={{ backgroundImage: "url('/randy-sob-desktop.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>
      
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}
      ></div>

      <div className="relative z-10">
        <HeroCarousel videos={featuredVideos} />
        <PeoplesWall videos={gridVideos} />
        <SnitchBox />
        
        {/* 2. Drop the Footer at the very bottom of the Content Portal */}
        <Footer />
      </div>
    </main>
  );
}