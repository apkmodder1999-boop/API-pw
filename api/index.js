// Vercel Serverless Function Engine
const fetch = require('node-fetch');

module.exports = async (req, res) => {
    const targetBaseUrl = "https://apis-maxxpw.vercel.app";
    
    // Inbound request parsing
    const incomingUrl = new URL(req.url, `http://${req.headers.host}`);
    const targetUrl = `${targetBaseUrl}${incomingUrl.pathname}${incomingUrl.search}`;

    // Mandatory Global CORS headers configuration
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Max-Age", "86400");

    // Preflight check router interception
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const headers = { ...req.headers };
        delete headers.host;

        // Bypassing requests to target endpoint
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
            redirect: "follow"
        });

        const contentType = response.headers.get("content-type");
        res.setHeader("Content-Type", contentType || "application/json");

        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            return res.status(response.status).json(json);
        } else {
            const text = await response.text();
            return res.status(response.status).send(text);
        }

    } catch (error) {
        return res.status(500).json({ error: "Proxy Execution Failed", message: error.message });
    }
};
