export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  try {
    // Call the Laravel endpoint that checks DB directly and returns bhandar info
    const response = await fetch("https://www.shrutseva.com/test/api/react_login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log("react_login response:", response.status, JSON.stringify(data));

    if (response.ok && data.success) {
      return res.status(200).json({
        success: true,
        user_type:     data.user_type    || null,
        bhandar_code:  data.bhandar_code || null,
        bhandar_label: data.bhandar_label || null,
        bhandar_name:  data.bhandar_name  || null,
      });
    }

    return res.status(401).json({
      success: false,
      message: data.message || "Invalid credentials. Please try again.",
    });

  } catch (err) {
    console.error("proxyLogin error:", err);
    return res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
}
