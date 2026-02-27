export async function handler(event) {
  const params = event.queryStringParameters || {};
  const url = params.url;

  if (!url) {
    return { statusCode: 400, body: 'Missing url' };
  }

  try {
    // --- detect domain redirect ---
    let redirectDomain = false;

    try {
      const head = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual'
      });

      if (head.status === 301 || head.status === 308) {
        const location = head.headers.get('location');
        if (location) {
          const from = new URL(url).hostname.replace(/^www\./, '');
          const to = new URL(location, url).hostname.replace(/^www\./, '');
          if (from !== to) redirectDomain = true;
        }
      }
    } catch {}

    // --- fetch sitemap ---
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: true, redirectDomain })
      };
    }

    const text = await res.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        xml: text,
        redirectDomain
      })
    };

  } catch {
    return { statusCode: 500, body: 'Server error' };
  }
}
