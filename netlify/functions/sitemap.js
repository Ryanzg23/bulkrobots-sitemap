export async function handler(event) {
  const params = event.queryStringParameters || {};
  const url = params.url;

  if (!url) {
    return { statusCode: 400, body: 'Missing url' };
  }

  try {
    let redirectDomain = false;

    // --- redirect detection ---
    try {
      const head = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual'
      });

      if (head.status === 301 || head.status === 308) {
        const location = head.headers.get('location');
        if (location) {
          const fromHost = new URL(url).hostname.replace(/^www\./, '');
          const toHost = new URL(location, url).hostname.replace(/^www\./, '');
          if (fromHost !== toHost) redirectDomain = true;
        }
      }
    } catch {}

    // --- fetch sitemap XML ---
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!res.ok) {
      return { statusCode: res.status, body: 'Fetch failed' };
    }

    const text = await res.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Access-Control-Allow-Origin': '*',
        'X-Redirect-Domain': redirectDomain ? '1' : '0'
      },
      body: text
    };
  } catch {
    return { statusCode: 500, body: 'Server error' };
  }
}
