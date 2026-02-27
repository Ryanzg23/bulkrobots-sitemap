export async function handler(event) {
  const params = event.queryStringParameters || {};
  const url = params.url;

  if (!url) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing url" })
    };
  } 

  try {
    let redirectDomain = false;

    /* ---------- DOMAIN REDIRECT DETECTION ---------- */
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

          if (fromHost !== toHost) {
            redirectDomain = true;
          }
        }
      }
    } catch {
      // ignore redirect detection errors
    }

    /* ---------- FETCH SITEMAP XML ---------- */
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SitemapViewer/1.0)"
      }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: true,
          redirectDomain
        })
      };
    }

    const xml = await res.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        xml,
        redirectDomain
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Server error",
        redirectDomain: false
      })
    };
  }
}

