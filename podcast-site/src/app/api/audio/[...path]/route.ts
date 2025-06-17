import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const audioUrl = 'https://' + params.path.join('/');
  
  try {
    console.log('Proxying audio request to:', audioUrl);
    
    const response = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PodcastSite/1.0)',
        // Forward range header for seeking support
        ...(request.headers.get('range') && { Range: request.headers.get('range')! }),
      },
    });

    if (!response.ok) {
      console.error('Audio proxy failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch audio' },
        { status: response.status }
      );
    }

    const headers = new Headers();
    
    // Copy relevant headers for audio streaming
    const headersToForward = [
      'content-type',
      'content-length',
      'accept-ranges',
      'content-range',
    ];
    
    headersToForward.forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    });

    // Enable CORS for audio requests
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Range');
    
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Audio proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy audio' },
      { status: 500 }
    );
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const audioUrl = 'https://' + params.path.join('/');
  
  try {
    const response = await fetch(audioUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PodcastSite/1.0)',
      },
    });

    const headers = new Headers();
    
    // Copy relevant headers
    const headersToForward = [
      'content-type',
      'content-length',
      'accept-ranges',
    ];
    
    headersToForward.forEach(headerName => {
      const headerValue = response.headers.get(headerName);
      if (headerValue) {
        headers.set(headerName, headerValue);
      }
    });

    headers.set('Access-Control-Allow-Origin', '*');
    
    return new NextResponse(null, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('Audio HEAD proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy audio' },
      { status: 500 }
    );
  }
}
