export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  const BASE = "https://www.shrutseva.com/test";

  try {
    // ── Step 1: Get CSRF token from login page ──────────────────────────
    const loginPageRes = await fetch(`${BASE}/accounts/login`, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" },
    });
    const html = await loginPageRes.text();
    const tokenMatch = html.match(/name="_token"\s+value="([^"]+)"/);
    const csrfToken = tokenMatch ? tokenMatch[1] : "";
    const cookies = extractCookies(loginPageRes.headers.get("set-cookie") || "");

    if (!csrfToken) {
      return res.status(500).json({ success: false, message: "Could not get CSRF token from live server." });
    }

    // ── Step 2: POST to /front_login ────────────────────────────────────
    const form = new URLSearchParams();
    form.append("_token", csrfToken);
    form.append("username", username);
    form.append("password", password);
    form.append("login", "frontend");

    const loginRes = await fetch(`${BASE}/front_login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Cookie: cookies,
        "User-Agent": "Mozilla/5.0",
        Referer: `${BASE}/accounts/login`,
        Origin: "https://www.shrutseva.com",
      },
      body: form.toString(),
      redirect: "manual",
    });

    const status = loginRes.status;
    const newCookies = extractCookies(loginRes.headers.get("set-cookie") || "") || cookies;

    console.log("front_login status:", status);

    // Validate login success:
    // If successful, Laravel returns a 200 JSON response with success: true and bhandar data.
    if (status !== 200) {
      return res.status(401).json({ success: false, message: "Invalid credentials. Please try again." });
    }

    let loginData = {};
    try {
      loginData = await loginRes.json();
    } catch (_) {
      return res.status(401).json({ success: false, message: "Invalid response from authentication server." });
    }

    if (!loginData || !loginData.success) {
      return res.status(401).json({ success: false, message: loginData.message || "Invalid credentials. Please try again." });
    }

    // ── Step 3: Get user information and Bhandar locks ──────────────────
    let bhandar_code  = loginData.bhandar_code || null;
    let bhandar_label = loginData.bhandar_label || null;
    let bhandar_name  = loginData.bhandar_name || null;
    let user_type     = loginData.user_type || "user";
    let userId          = null;

    // Optional: fetch user ID for admin (so they see bhandars list count)
    try {
      const userListRes = await fetch(
        `${BASE}/get_user_list?search_value=${encodeURIComponent(username)}&length=5`,
        {
          headers: {
            Accept: "application/json",
            Cookie: newCookies,
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0",
          },
        }
      );
      if (userListRes.ok) {
        const ud = await userListRes.json();
        const found = (ud.data || []).find(
          (u) => u.username.toLowerCase() === username.toLowerCase()
        );
        if (found) {
          userId = found.id;
          console.log("Resolved userId from list:", userId);
        }
      }
    } catch (e) {
      console.log("get_user_list (optional) error:", e.message);
    }



    // Collect all Set-Cookie headers from both responses to pass back to the client
    const allSetCookies = [];
    const getCookiesFromRes = (response) => {
      if (response.headers && typeof response.headers.getSetCookie === 'function') {
        return response.headers.getSetCookie();
      }
      const raw = response.headers ? response.headers.get("set-cookie") : null;
      if (raw) {
        // Fallback for environments where getSetCookie is not supported
        return raw.split(/,(?=[A-Za-z0-9_-]+=)/);
      }
      return [];
    };

    allSetCookies.push(...getCookiesFromRes(loginPageRes));
    allSetCookies.push(...getCookiesFromRes(loginRes));

    const cleanedCookies = allSetCookies.map(cookieStr => {
      // Remove any explicit Domain attribute so the browser assigns it to the current host (vercel or localhost)
      let cleaned = cookieStr.replace(/;\s*domain=[^;]+/gi, '');
      // Strip secure flag if running on HTTP (localhost/127.0.0.1)
      const host = req.headers.host || '';
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        cleaned = cleaned.replace(/;\s*secure/gi, '');
      }
      return cleaned;
    });

    if (cleanedCookies.length > 0) {
      res.setHeader('Set-Cookie', cleanedCookies);
    }

    return res.status(200).json({
      success: true,
      user_id:      userId,
      user_type,
      bhandar_code,
      bhandar_label,
      bhandar_name,
    });


  } catch (err) {
    console.error("proxyLogin error:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
}

function extractCookies(setCookieHeader) {
  if (!setCookieHeader) return "";
  const parts = setCookieHeader.split(/,(?=[^ ])/);
  return parts
    .map((p) => {
      const m = p.trim().match(/^([^=]+)=([^;]*)/);
      return m ? `${m[1]}=${m[2]}` : null;
    })
    .filter(Boolean)
    .join("; ");
}
