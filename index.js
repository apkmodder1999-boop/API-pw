module.exports = async (req, res) => {
    // Target API base address
    const targetBaseUrl = "https://apis-maxxpw.vercel.app";
    
    // Auto routing mapping
    const path = req.url;
    const targetUrl = `${targetBaseUrl}${path}`;

    // Full CORS Access configuration for Android WebViews / Apps
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Max-Age", "86400");

    // Intercept OPTIONS requests instantly
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const headers = { ...req.headers };
        delete headers.host;

        // Using native built-in global fetch (No package.json needed anymore!)
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: headers,
            body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
            redirect: "follow"
        });

        const contentType = response.headers.get("content-type");
        res.setHeader("Content-Type", contentType || "application/json");

        // Dynamic response handling
        if (contentType && contentType.includes("application/json")) {
            const json = await response.json();
            return res.status(response.status).json(json);
        } else {
            const text = await response.text();
            return res.status(response.status).send(text);
        }

    } catch (error) {
        return res.status(500).json({ error: "Native Proxy Engine Failed", message: error.message });
    }
};
