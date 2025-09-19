import { NextRequest, NextResponse } from 'next/server';

// The API route handler - SIMPLIFIED FOR DEBUGGING
export async function GET(request: NextRequest) {
    
    // Log a simple, static message to test the logging system itself.
    console.log('--- SIMPLE TEST LOG: If you see this, logging works. ---');

    try {
        const result = { 
            success: true, 
            message: "This is a simplified test response to check if the Vercel logging mechanism is working at all." 
        };
        
        // Return a static JSON response.
        return NextResponse.json(result);

    } catch (error) {
        // This catch block should ideally not be reached in this simplified version.
        console.error('[ERROR] in simplified trigger:', error);
        return NextResponse.json({ success: false, message: 'Simplified test failed' }, { status: 500 });
    }
}
