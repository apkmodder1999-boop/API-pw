export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Target Vercel API URL taiyar karna
    const targetUrl = `${env.BASE_API_URL}${url.pathname}${url.search}`;

    // Handling CORS Preflight Options Request (Taaki app block na kare)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
          "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    try {
      // Vercel ki original API ko request bhejna
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: new Headers(request.headers),
        body: request.body,
        redirect: "follow"
      });

      // Response receive karna
      const response = await fetch(modifiedRequest);

      // Naya response banana CORS headers ke sath taaki Android app me aaram se chale
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      newHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
      newHeaders.set("Access-Control-Allow-Headers", "*");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: "Proxy Failed", message: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  },
};
