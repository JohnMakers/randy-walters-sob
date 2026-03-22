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

  // New states for the YouTube Quick-Add form
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

  const updateVideoOrder = async (id: string, priority_order: number) => {
    await supabase.from('videos').update({ priority_order }).eq('id', id);
    fetchVideos();
  };

  // Function to inject a YouTube video directly
  const handleAddYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytTitle || !ytUrl) return;

    const { error } = await supabase.from('videos').insert([
      { title: ytTitle, youtube_url: ytUrl, status: 'public', priority_order: 10 }
    ]);

    if (error) {
      alert("Error adding YouTube video: " + error.message);
    } else {
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

  return (
    <div className="min-h-screen bg-[var(--color-groove-green-dark)] p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end border-b-4 border-[var(--color-groove-gold)] pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-black text-[var(--color-groove-gold)] uppercase tracking-wide">The Control Room</h1>
            <p className="text-[var(--color-groove-green-light)] font-bold mt-1">Manage the madness.</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="bg-black border-2 border-[var(--color-groove-red)] text-[var(--color-groove-red)] px-4 py-2 rounded font-bold hover:bg-[var(--color-groove-red)] hover:text-white transition-all">
            Bail Out (Log Out)
          </button>
        </div>

        {/* Quick Add YouTube Section */}
        <div className="bg-black border-2 border-[var(--color-groove-gold)] rounded-xl p-6 mb-8 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
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
              Pin to Wall
            </button>
          </form>
        </div>

        {/* The Moderation Table */}
        <div className="bg-black border-2 border-[var(--color-groove-green-light)] rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-groove-green)] text-[var(--color-groove-gold)] uppercase text-sm font-black tracking-wider">
                <th className="p-4">Evidence Source / Title</th>
                <th className="p-4">Status</th>
                <th className="p-4 w-24">Order</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400 font-bold">The Snitch Box is empty.</td>
                </tr>
              ) : videos.map((video) => (
                <tr key={video.id} className="border-t border-[var(--color-groove-green-light)] hover:bg-[var(--color-groove-green-dark)] transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{video.title}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {video.youtube_url ? `YouTube: ${video.youtube_url}` : 'Mux Upload'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs uppercase font-black rounded ${
                      video.status === 'public' ? 'bg-green-500 text-black' : 
                      video.status === 'pending' ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'
                    }`}>
                      {video.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      defaultValue={video.priority_order}
                      onBlur={(e) => updateVideoOrder(video.id, parseInt(e.target.value))}
                      className="w-16 bg-black border border-[var(--color-groove-gold)] rounded p-1 text-center text-white"
                    />
                  </td>
                  <td className="p-4 flex gap-2 justify-end">
                    {video.status !== 'public' && (
                      <button onClick={() => updateVideoStatus(video.id, 'public')} className="bg-[var(--color-groove-green)] text-white px-3 py-1 rounded text-sm font-bold hover:bg-[var(--color-groove-green-light)]">
                        Approve
                      </button>
                    )}
                    {video.status !== 'hidden' && (
                      <button onClick={() => updateVideoStatus(video.id, 'hidden')} className="bg-[var(--color-groove-red)] text-white px-3 py-1 rounded text-sm font-bold hover:bg-[var(--color-groove-red-dark)]">
                        Hide
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}