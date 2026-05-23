export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const loginRes = await fetch("https://www.shrutseva.com/test/login");
    const html = await loginRes.text();
    const tokenMatch = html.match(/<meta name="csrf-token" content="([^"]+)">/);
    const token = tokenMatch ? tokenMatch[1] : "";
    
    // Parse cookies robustly
    const rawCookies = loginRes.headers.get("set-cookie");
    let cookieStr = "";
    if (rawCookies) {
      // Split by comma, but be careful not to split inside dates (like "Thu, 01 Jan 1970")
      // A safe way is to regex match all set-cookie header parts
      // But fetch API merges them into one string with commas.
      // Laravel cookies usually look like: XSRF-TOKEN=val; expires=..., laravel_session=val; expires=...
      const parts = rawCookies.split(/, (?=[A-Za-z0-9_-]+=)/);
      const parsed = [];
      for (const part of parts) {
        const match = part.match(/^([^=]+)=([^;]+)/);
        if (match) {
          parsed.push(match[1] + "=" + match[2]);
        }
      }
      cookieStr = parsed.join("; ");
    }

    const { username, password } = req.body;
    const params = new URLSearchParams();
    params.append("_token", token);
    params.append("username", username);
    params.append("password", password);
    params.append("login", "frontend");

    const postRes = await fetch("https://www.shrutseva.com/test/front_login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": cookieStr,
        "X-Requested-With": "XMLHttpRequest"
      },
      body: params,
      redirect: "manual"
    });

    const location = postRes.headers.get("location");
    const newCookies = postRes.headers.get("set-cookie") || rawCookies;

    if (postRes.status === 302 && location && location.includes("/dashboard")) {
      if (newCookies) {
        // Split set-cookie properly for multiple headers
        const parts = newCookies.split(/, (?=[A-Za-z0-9_-]+=)/);
        res.setHeader("Set-Cookie", parts);
      }
      return res.status(200).json({ success: true, redirect: location });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
