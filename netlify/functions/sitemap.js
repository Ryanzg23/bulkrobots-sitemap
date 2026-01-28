export async function handler(event) {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing url parameter'
    };
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Sitemap Viewer)'
      }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: 'Unable to fetch sitemap'
      };
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
    return {
      statusCode: 500,
      body: 'Server error'
    };
  }
}