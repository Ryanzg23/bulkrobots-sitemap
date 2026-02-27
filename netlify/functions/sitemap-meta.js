export async function handler(event) {
  const url = event.queryStringParameters?.url;
  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: true })
    };
  }

  try {
    let redirectDomain = false;

    try {
      const head = await fetch(url, {
        method: "HEAD",
        redirect: "manual"
      });

      if (head.status === 301 || head.status === 308) {
        const location = head.headers.get("location");
        if (location) {
          const fromHost = new URL(url).hostname.replace(/^www\./, "");
          const toHost = new URL(location, url).hostname.replace(/^www\./, "");
          if (fromHost !== toHost) redirectDomain = true;
        }
      }
    } catch {}

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ redirectDomain })
    };

  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: true })
    };
  }
}
