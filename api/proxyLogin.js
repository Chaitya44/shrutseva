export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const BASE_URL = "https://www.shrutseva.com/test";

    // Step 1: GET the login page to fetch CSRF token and session cookie
    const loginPageRes = await fetch(`${BASE_URL}/login`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      }
    });

    const html = await loginPageRes.text();

    // Extract CSRF token from meta tag
    const tokenMatch = html.match(/name="csrf-token" content="([^"]+)"/);
    const token = tokenMatch ? tokenMatch[1] : "";

    if (!token) {
      console.error("Could not extract CSRF token from login page");
      return res.status(500).json({ success: false, message: "Could not get CSRF token" });
    }

    // Extract session cookies from the GET response
    const setCookieHeader = loginPageRes.headers.get("set-cookie");
    let sessionCookie = "";
    if (setCookieHeader) {
      // Parse all cookies, extract name=value pairs
      const cookies = [];
      // set-cookie header is combined with ", " between different cookies in node-fetch
      // Split on pattern: ", cookieName=" where cookieName starts a new cookie
      const cookieParts = setCookieHeader.split(/,\s*(?=[A-Za-z0-9_\-]+=)/);
      for (const part of cookieParts) {
        const match = part.match(/^([^=\s]+)=([^;]*)/);
        if (match) {
          cookies.push(`${match[1]}=${match[2]}`);
        }
      }
      sessionCookie = cookies.join("; ");
    }

    console.log("CSRF Token:", token);
    console.log("Session Cookie:", sessionCookie);

    // Step 2: POST credentials to front_login
    const { username, password } = req.body;

    const formData = new URLSearchParams();
    formData.append("_token", token);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("login", "frontend");

    const postRes = await fetch(`${BASE_URL}/front_login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": sessionCookie,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": `${BASE_URL}/login`,
        "Origin": "https://www.shrutseva.com",
      },
      body: formData.toString(),
      redirect: "manual", // Don't follow redirects automatically
    });

    const responseStatus = postRes.status;
    const location = postRes.headers.get("location") || "";
    const responseCookies = postRes.headers.get("set-cookie") || "";

    console.log("POST Response Status:", responseStatus);
    console.log("Location:", location);
    console.log("Response Cookies:", responseCookies);

    // Success: Laravel redirects away from /login (usually to /dashboard or home)
    // Failure: Laravel redirects back to /login
    if (responseStatus === 302 && location && !location.includes("/login")) {
      // Success - user is authenticated
      return res.status(200).json({ success: true, redirect: location });
    } else if (responseStatus === 302 && location && location.includes("/login")) {
      // Redirected back to login = bad credentials
      return res.status(401).json({ success: false, message: "Invalid credentials. Please try again." });
    } else if (responseStatus === 200) {
      // If 200 returned, it likely means the form was shown again (failed login)
      const responseText = await postRes.text();
      if (responseText.includes("error") || responseText.includes("invalid") || responseText.includes("credentials")) {
        return res.status(401).json({ success: false, message: "Invalid credentials. Please try again." });
      }
      // Unexpected 200 - treat as success if no error indicators
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Login failed. Status: " + responseStatus });
    }
  } catch (err) {
    console.error("proxyLogin error:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
}
