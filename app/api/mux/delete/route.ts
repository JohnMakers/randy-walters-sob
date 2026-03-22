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
      return NextResponse.json({ error: 'No ID provided' }, { status: 400 });
    }

    try {
      // Step 1: Try deleting it as a fully processed Asset
      await mux.video.assets.delete(assetId);
      console.log(`Successfully purged Mux Asset: ${assetId}`);
    } catch (assetError: any) {
      console.log(`Failed to delete as Asset. Checking if it is an Upload ID...`);
      
      try {
        // Step 2: Try cancelling it if it's stuck as a pending Upload
        const upload = await mux.video.uploads.retrieve(assetId);
        
        if (upload.asset_id) {
          await mux.video.assets.delete(upload.asset_id);
          console.log(`Successfully purged Mux Asset via Upload ID: ${upload.asset_id}`);
        } else {
          await mux.video.uploads.cancel(assetId);
          console.log(`Successfully cancelled pending Mux Upload: ${assetId}`);
        }
      } catch (uploadError: any) {
         console.log(`Could not find record in Mux. It may already be deleted.`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}