// app/page.tsx
import { supabase } from '../lib/supabase';
import HeroCarousel from '../components/HeroCarousel';
import PeoplesWall from '../components/PeoplesWall';
import SnitchBox from '../components/SnitchBox';

export const revalidate = 0; 

export default async function Home() {
  const { data: videos, error } = await supabase
    .from('videos')
    .select('*')
    .eq('status', 'public')
    .order('priority_order', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) console.error("Error fetching videos:", error);

  const safeVideos = videos || [];
  const featuredVideos = safeVideos.slice(0, 3);
  const gridVideos = safeVideos.slice(3);

  return (
    // Added h-screen, overflow-y-auto, snap-y, and snap-mandatory 
    <main className="relative h-screen w-full overflow-y-auto snap-y snap-mandatory bg-[var(--color-groove-green-dark)] selection:bg-[var(--color-groove-red)] selection:text-white scroll-smooth">
      
      {/* GLOBAL GRUNGY BACKGROUND */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-20 mix-blend-luminosity"
        style={{ backgroundImage: "url('/randy-sob-desktop.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>
      
      {/* GLOBAL CRT SCANLINES */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-10"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)' }}
      ></div>

      {/* CONTENT PORTAL */}
      <div className="relative z-10">
        <HeroCarousel videos={featuredVideos} />
        <PeoplesWall videos={gridVideos} />
        <SnitchBox />
      </div>
    </main>
  );
}