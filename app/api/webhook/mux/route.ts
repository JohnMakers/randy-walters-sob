// app/api/webhook/mux/route.ts
import { NextResponse } from 'next/server';
import Mux from '@mux/mux-node';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const headers = req.headers;
    const muxSignature = headers.get('mux-signature');

    if (!muxSignature) {
      return new NextResponse('Missing Mux Signature', { status: 401 });
    }

    // 1. Verify the secret handshake. Ensures some rando isn't pinging our DB.
    const event = mux.webhooks.unwrap(
      payload,
      headers,
      process.env.MUX_WEBHOOK_SECRET!
    );

    // 2. Listen for the specific event: when an upload successfully creates a video asset
    if (event.type === 'video.upload.asset_created') {
      const uploadId = event.data.id;
      const assetId = event.data.asset_id;

      if (!assetId) throw new Error('No Asset ID found in webhook payload');

      // 3. Ask Mux for the actual playback details of this new asset
      const asset = await mux.video.assets.retrieve(assetId);
      const playbackId = asset.playback_ids?.find((p: any) => p.policy === 'public')?.id;

      if (playbackId) {
        // 4. Use "God Mode" to update our DB row. 
        // We find the row using the uploadId we saved earlier in the SnitchBox!
        const { error } = await supabaseAdmin
          .from('videos')
          .update({ 
            mux_asset_id: assetId, 
            mux_playback_id: playbackId 
          })
          .eq('mux_asset_id', uploadId);

        if (error) {
          console.error('Supabase Update Error:', error);
          throw error;
        }

        console.log(`Successfully wired up playback ID for asset: ${assetId}`);
      }
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });

  } catch (error) {
    console.error('Mux Webhook Error:', error);
    return new NextResponse('Webhook Error', { status: 400 });
  }
}