import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Use globalThis to survive Next.js HMR (Hot Module Replacement).
// Without this, every time you save a file, Next.js re-evaluates this module 
// and resets the variable back to {}, wiping all data the extension just sent.
const globalForUsage = globalThis as unknown as { usageData: Record<string, number> };
if (!globalForUsage.usageData) {
  globalForUsage.usageData = {};
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Merge new data into persistent store
    globalForUsage.usageData = { ...globalForUsage.usageData, ...body };
    
    console.log('[TrimSub API] POST received. Current data:', globalForUsage.usageData);
    
    return NextResponse.json({ success: true, data: globalForUsage.usageData }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers: corsHeaders });
  }
}

export async function GET() {
  return NextResponse.json(globalForUsage.usageData, { headers: corsHeaders });
}
