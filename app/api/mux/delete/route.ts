// app/api/mux/delete/route.ts
import Mux from '@mux/mux-node';
import { NextResponse } from 'next/server';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { assetId } = await req.json();

    if (!assetId) {
      return NextResponse.json({ error: 'No Asset ID provided' }, { status: 400 });
    }

    // Attempt to delete the asset directly from Mux. 
    // If the string is an Upload ID instead of an Asset ID (e.g. still processing), Mux might throw a 404, 
    // which is fine, we just catch it and move on so the DB row still gets deleted.
    try {
      await mux.video.assets.delete(assetId);
      console.log(`Successfully purged Mux Asset: ${assetId}`);
    } catch (muxError: any) {
      console.log(`Mux Deletion skipped/failed (might be an unfinished upload): ${muxError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}