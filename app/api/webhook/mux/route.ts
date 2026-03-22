// app/api/webhook/mux/route.ts
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: Request) {
  console.log('--- MUX WEBHOOK INCOMING ---');

  try {
    const payload = await req.text();
    const headersList = req.headers;
    const muxSignature = headersList.get('mux-signature');

    if (!muxSignature) {
      console.error('CRITICAL: Missing Mux Signature');
      return new NextResponse('Missing Mux Signature', { status: 401 });
    }

    const headers = Object.fromEntries(headersList.entries());
    
    const event = mux.webhooks.unwrap(
      payload,
      headers,
      process.env.MUX_WEBHOOK_SECRET!
    );

    console.log(`STEP 1: Event Unwrapped Successfully! Type: ${event.type}`);

    if (event.type === 'video.upload.asset_created') {
      const uploadId = event.data.id;
      const assetId = event.data.asset_id;

      if (!assetId) {
        throw new Error('No Asset ID found');
      }

      console.log(`STEP 2: Fetching playback details for asset ${assetId}...`);
      
      try {
        // We wrap the Mux API call in its own try/catch to handle the 404 ghosts
        const asset = await mux.video.assets.retrieve(assetId);
        const playbackId = asset.playback_ids?.find((p: any) => p.policy === 'public')?.id;

        if (playbackId) {
          console.log(`STEP 3: Playback ID found! Updating Database for Upload ID: ${uploadId}`);
          
          const { error } = await supabaseAdmin
            .from('videos')
            .update({ 
              mux_asset_id: assetId, 
              mux_playback_id: playbackId 
            })
            .eq('mux_asset_id', uploadId);

          if (error) throw error;
          
          console.log(`STEP 4 SUCCESS: Database updated perfectly!`);
        }
      } catch (muxLookupError: any) {
        // GHOST CATCHER: If the asset is 404, we catch it here so the webhook doesn't crash
        if (muxLookupError.status === 404) {
          console.log(`GHOST CAUGHT: Asset ${assetId} no longer exists in Mux. Skipping database update.`);
        } else {
          // If it's a different error, we still want to throw it
          throw muxLookupError;
        }
      }
    } else {
      console.log(`Ignored irrelevant event type: ${event.type}`);
    }

    // ALWAYS return 200 so Mux knows we handled it and stops spamming retries
    return new NextResponse('Webhook processed successfully', { status: 200 });

  } catch (error: any) {
    console.error('--- MUX WEBHOOK FATAL CRASH ---');
    console.error('Error Details:', error.message);
    // Even on a fatal crash, returning 200 stops the retry loop for bad data
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 200 });
  }
}