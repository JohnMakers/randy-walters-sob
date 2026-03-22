// app/api/upload/route.ts
import Mux from '@mux/mux-node';
import { NextResponse } from 'next/server';

// Initialize the Mux client
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST() {
  try {
    // Tell Mux we want a secure URL for a user to upload a video
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        video_quality: 'basic', 
      },
      cors_origin: '*', // Secure this to your actual domain in production
    });

    return NextResponse.json({ url: upload.url, id: upload.id });
  } catch (error) {
    console.error('Mux Direct Upload Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate the golden ticket for Mux.' }, 
      { status: 500 }
    );
  }
}