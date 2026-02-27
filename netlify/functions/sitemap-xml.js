export async function handler(event) {
  const url = event.queryStringParameters?.url;
  if (!url) return { statusCode: 400, body: "Missing url" };

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const xml = await res.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml"
      },
      body: xml
    };
  } catch {
    return { statusCode: 500, body: "Error fetching sitemap" };
  }
}
