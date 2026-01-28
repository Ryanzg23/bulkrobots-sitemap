export async function handler(event) {
  const params = event.queryStringParameters || {};
  const url = params.url;

  if (!url) {
    return { statusCode: 400, body: 'Missing url' };
  }

  try {
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
        'Access-Control-Allow-Origin': '*'
      },
      body: text
    };
  } catch {
    return { statusCode: 500, body: 'Server error' };
  }
}
