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

    console.log('STEP 1: Signature received:', !!muxSignature);

    if (!muxSignature) {
      console.error('CRITICAL: Missing Mux Signature');
      return new NextResponse('Missing Mux Signature', { status: 401 });
    }

    // CRUCIAL FIX: Convert Next.js Headers to a standard dictionary for the Mux SDK
    const headers = Object.fromEntries(headersList.entries());

    console.log('STEP 2: Attempting to unwrap and verify event...');
    
    const event = mux.webhooks.unwrap(
      payload,
      headers,
      process.env.MUX_WEBHOOK_SECRET!
    );

    console.log(`STEP 3: Event Unwrapped Successfully! Type: ${event.type}`);

    if (event.type === 'video.upload.asset_created') {
      const uploadId = event.data.id;
      const assetId = event.data.asset_id;

      console.log(`STEP 4: Target Event detected. Upload ID: ${uploadId} | Asset ID: ${assetId}`);

      if (!assetId) {
        console.error('CRITICAL: No Asset ID found in webhook payload');
        throw new Error('No Asset ID found');
      }

      console.log(`STEP 5: Retrieving playback details from Mux for asset ${assetId}...`);
      const asset = await mux.video.assets.retrieve(assetId);
      const playbackId = asset.playback_ids?.find((p: any) => p.policy === 'public')?.id;

      console.log(`STEP 6: Playback ID found: ${playbackId || 'NONE'}`);

      if (playbackId) {
        console.log(`STEP 7: Engaging God Mode to update Supabase row for Upload ID: ${uploadId}...`);
        
        const { error, data } = await supabaseAdmin
          .from('videos')
          .update({ 
            mux_asset_id: assetId, 
            mux_playback_id: playbackId 
          })
          .eq('mux_asset_id', uploadId)
          .select();

        if (error) {
          console.error('STEP 8 ERROR: Supabase Database Update Failed:', error);
          throw error;
        }

        console.log(`STEP 9 SUCCESS: Database row updated perfectly!`, data);
      } else {
        console.log(`WARNING: No public playback ID found for asset ${assetId}`);
      }
    } else {
      console.log(`Ignored irrelevant event type: ${event.type}`);
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });

  } catch (error: any) {
    console.error('--- MUX WEBHOOK CRASHED ---');
    console.error('Error Details:', error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
}