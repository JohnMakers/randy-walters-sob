// app/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [ytTitle, setYtTitle] = useState('');
  const [ytUrl, setYtUrl] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchVideos();
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchVideos();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchVideos = async () => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('priority_order', { ascending: true }) 
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching videos:', error);
    else setVideos(data || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const updateVideoStatus = async (id: string, status: 'public' | 'hidden' | 'pending') => {
    await supabase.from('videos').update({ status }).eq('id', id);
    fetchVideos(); 
  };

  // SMART APPROVAL: Routes to Wall and assigns the last score automatically
  const approveVideo = async (id: string) => {
    // Find the highest priority number currently on The Wall
    const wallOrders = videos.filter(v => !v.is_featured && v.status === 'public').map(v => v.priority_order || 0);
    const nextOrder = wallOrders.length > 0 ? Math.max(...wallOrders) + 1 : 1;

    await supabase.from('videos').update({ 
      status: 'public',
      is_featured: false, // Default to Wall
      priority_order: nextOrder 
    }).eq('id', id);
    
    fetchVideos();
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    await supabase.from('videos').update({ is_featured: !currentStatus }).eq('id', id);
    fetchVideos();
  };

  const updateVideoOrder = async (id: string, newOrder: number, isFeatured: boolean) => {
    const isDuplicate = videos.some(v => v.id !== id && v.is_featured === isFeatured && v.priority_order === newOrder && v.status === 'public');
    
    if (isDuplicate) {
      alert(`Order #${newOrder} is already being used in this section. Please choose a unique number to avoid display issues.`);
      fetchVideos(); 
      return;
    }

    await supabase.from('videos').update({ priority_order: newOrder }).eq('id', id);
    fetchVideos();
  };

  // COMPLETE DESTROY: Deletes from Mux servers first, then wipes from Supabase
  const deleteVideo = async (id: string, muxAssetId: string | null) => {
    if (window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete this evidence? It will be wiped from Mux and the database. This cannot be undone.")) {
      
      // 1. If it's a Mux video (not YouTube), wipe it from Mux storage
      if (muxAssetId && !muxAssetId.startsWith('http')) {
        try {
          await fetch('/api/mux/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId: muxAssetId })
          });
        } catch (e) {
          console.error("Failed to reach Mux Delete API", e);
        }
      }

      // 2. Wipe it from Supabase
      await supabase.from('videos').delete().eq('id', id);
      fetchVideos();
    }
  };

  const handleAddYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytTitle || !ytUrl) return;

    const heroOrders = videos.filter(v => v.is_featured && v.status === 'public').map(v => v.priority_order || 0);
    const nextOrder = heroOrders.length > 0 ? Math.max(...heroOrders) + 1 : 1;

    const { error } = await supabase.from('videos').insert([
      { title: ytTitle, youtube_url: ytUrl, status: 'public', priority_order: nextOrder, is_featured: true }
    ]);

    if (error) alert("Error adding YouTube video: " + error.message);
    else {
      setYtTitle('');
      setYtUrl('');
      fetchVideos();
    }
  };

  if (loading) return <div className="min-h-screen bg-[var(--color-groove-green-dark)] flex items-center justify-center text-[var(--color-groove-gold)] font-bold text-2xl">Checking VIP List...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-[var(--color-groove-green-dark)] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-black border-4 border-[var(--color-groove-gold)] p-8 rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.2)] max-w-md w-full flex flex-col gap-4">
          <h1 className="text-3xl font-black text-[var(--color-groove-gold)] uppercase text-center mb-4">Admin Access</h1>
          <input 
            type="email" placeholder="Email" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] rounded p-3 text-white focus:border-[var(--color-groove-gold)] outline-none"
          />
          <input 
            type="password" placeholder="Password" required
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] rounded p-3 text-white focus:border-[var(--color-groove-gold)] outline-none"
          />
          <button type="submit" className="w-full bg-[var(--color-groove-red)] text-white font-bold py-3 rounded hover:bg-[var(--color-groove-red-dark)] transition-colors uppercase mt-2">
            Unlock the Vault
          </button>
        </form>
      </div>
    );
  }

  // Segment the videos based on their status and placement
  const pendingVideos = videos.filter(v => v.status === 'pending');
  const heroVideos = videos.filter(v => v.is_featured && v.status === 'public');
  const wallVideos = videos.filter(v => !v.is_featured && v.status === 'public');

  const VideoTableRow = ({ video, showSort = true, showPlacement = true }: { video: any, showSort?: boolean, showPlacement?: boolean }) => {
    const isProcessing = video.mux_playback_id?.startsWith('processing');
    return (
      <tr className="border-t border-[var(--color-groove-green-light)] hover:bg-[var(--color-groove-green-dark)] transition-colors">
        {showSort && (
          <td className="p-4 w-24">
            <input 
              type="number" 
              defaultValue={video.priority_order}
              onBlur={(e) => updateVideoOrder(video.id, parseInt(e.target.value), video.is_featured)}
              className="w-16 bg-black border border-[var(--color-groove-green-light)] rounded p-2 text-center text-white focus:border-[var(--color-groove-gold)] outline-none font-bold"
            />
          </td>
        )}
        <td className="p-4">
          <div className="font-bold text-white">{video.title}</div>
          <div className="text-xs text-gray-400 mt-1">
            {video.youtube_url ? `YouTube: ${video.youtube_url}` : 'Mux Direct Upload'}
          </div>
        </td>
        <td className="p-4">
          {video.youtube_url ? (
            <span className="text-gray-500 text-xs font-bold uppercase">N/A (YouTube)</span>
          ) : isProcessing ? (
            <span className="text-yellow-500 text-xs font-black uppercase animate-pulse">Processing...</span>
          ) : (
            <span className="text-green-400 text-xs font-bold uppercase">Ready</span>
          )}
        </td>
        <td className="p-4 flex gap-2 justify-end flex-wrap">
          {video.status === 'pending' && (
            <button onClick={() => approveVideo(video.id)} className="bg-[var(--color-groove-green)] text-white px-4 py-1 rounded text-sm font-black uppercase hover:bg-[var(--color-groove-green-light)] border border-green-400 shadow-[0_0_10px_rgba(45,106,79,0.5)]">
              Approve to Wall
            </button>
          )}
          
          {showPlacement && video.status === 'public' && (
            <button 
              onClick={() => toggleFeatured(video.id, video.is_featured)}
              className="bg-black border border-[var(--color-groove-gold)] text-[var(--color-groove-gold)] px-3 py-1 rounded text-sm font-bold hover:bg-[var(--color-groove-gold)] hover:text-black transition-colors"
            >
              Move to {video.is_featured ? 'Wall' : 'Hero'}
            </button>
          )}
          
          {video.status !== 'pending' && video.status !== 'hidden' && (
            <button onClick={() => updateVideoStatus(video.id, 'hidden')} className="bg-zinc-800 text-white px-3 py-1 rounded text-sm font-bold hover:bg-zinc-700 border border-zinc-600">
              Hide
            </button>
          )}

          {video.status === 'hidden' && (
            <button onClick={() => updateVideoStatus(video.id, 'public')} className="bg-[var(--color-groove-green)] text-white px-3 py-1 rounded text-sm font-bold hover:bg-[var(--color-groove-green-light)]">
              Unhide
            </button>
          )}
          
          <button onClick={() => deleteVideo(video.id, video.mux_asset_id)} className="bg-transparent border border-[var(--color-groove-red)] text-[var(--color-groove-red)] px-3 py-1 rounded text-sm font-bold hover:bg-[var(--color-groove-red)] hover:text-white transition-colors">
            Destroy
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-groove-green-dark)] p-4 md:p-8 text-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-[var(--color-groove-gold)] pb-4 mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-[var(--color-groove-gold)] uppercase tracking-wide">The Control Room</h1>
            <p className="text-[var(--color-groove-green-light)] font-bold mt-1">Manage the madness.</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="bg-black border-2 border-[var(--color-groove-red)] text-[var(--color-groove-red)] px-4 py-2 rounded font-bold hover:bg-[var(--color-groove-red)] hover:text-white transition-all">
            Bail Out (Log Out)
          </button>
        </div>

        {/* SECTION 1: PENDING APPROVAL */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-yellow-500 uppercase mb-4 border-l-8 border-yellow-500 pl-4 animate-pulse">
            Pending Approval ({pendingVideos.length})
          </h2>
          <div className="bg-black border-2 border-yellow-500/50 rounded-xl overflow-x-auto shadow-[0_0_20px_rgba(234,179,8,0.1)]">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-yellow-900/40 text-yellow-500 uppercase text-sm font-black tracking-wider">
                  <th className="p-4">Evidence Title</th>
                  <th className="p-4">Encoding</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingVideos.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest">No new evidence submitted.</td></tr>
                ) : pendingVideos.map((video) => <VideoTableRow key={video.id} video={video} showSort={false} showPlacement={false} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Add YouTube Section */}
        <div className="bg-black border-2 border-[var(--color-groove-gold)] rounded-xl p-6 mb-12 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
          <h2 className="text-2xl font-black text-[var(--color-groove-gold)] uppercase mb-4">Add Official YouTube Video</h2>
          <form onSubmit={handleAddYouTube} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" placeholder="Video Title" required
              value={ytTitle} onChange={(e) => setYtTitle(e.target.value)}
              className="flex-1 bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] rounded p-3 text-white focus:border-[var(--color-groove-gold)] outline-none"
            />
            <input 
              type="url" placeholder="YouTube URL (https://youtube.com/watch...)" required
              value={ytUrl} onChange={(e) => setYtUrl(e.target.value)}
              className="flex-1 bg-[var(--color-groove-green-dark)] border-2 border-[var(--color-groove-green-light)] rounded p-3 text-white focus:border-[var(--color-groove-gold)] outline-none"
            />
            <button type="submit" className="bg-[var(--color-groove-red)] hover:bg-[var(--color-groove-red-dark)] text-white font-black px-6 py-3 rounded uppercase transition-colors">
              Inject to Hero
            </button>
          </form>
        </div>

        {/* SECTION 2: HERO CAROUSEL */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-[var(--color-groove-gold)] uppercase mb-4 border-l-8 border-[var(--color-groove-red)] pl-4">
            Hero Carousel (Featured)
          </h2>
          <div className="bg-black border-2 border-[var(--color-groove-green-light)] rounded-xl overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[var(--color-groove-green)] text-[var(--color-groove-gold)] uppercase text-sm font-black tracking-wider">
                  <th className="p-4">Sort</th>
                  <th className="p-4">Evidence Title</th>
                  <th className="p-4">Encoding</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {heroVideos.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-bold">No videos in the Hero Carousel.</td></tr>
                ) : heroVideos.map((video) => <VideoTableRow key={video.id} video={video} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 3: THE WALL */}
        <div>
          <h2 className="text-3xl font-black text-[var(--color-groove-gold)] uppercase mb-4 border-l-8 border-[var(--color-groove-gold)] pl-4">
            The People's Wall (Grid)
          </h2>
          <div className="bg-black border-2 border-[var(--color-groove-green-light)] rounded-xl overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[var(--color-groove-green)] text-[var(--color-groove-gold)] uppercase text-sm font-black tracking-wider">
                  <th className="p-4">Sort</th>
                  <th className="p-4">Evidence Title</th>
                  <th className="p-4">Encoding</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallVideos.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400 font-bold">No videos on The Wall.</td></tr>
                ) : wallVideos.map((video) => <VideoTableRow key={video.id} video={video} />)}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}