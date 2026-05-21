const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.SESSION_SECRET || "supersecretkey";

const logMiddleware = (req, res, next) => {
  if (req.method === "POST") {
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let userId = "unauthenticated";
        const token = req.cookies?.token;
        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
          } catch {}
        }
        console.log(`[POST LOG] Timestamp: ${new Date().toISOString()} | User ID: ${userId} | Route: ${req.originalUrl}`);
      }
      return originalJson(data);
    };
  }
  next();
};

module.exports = logMiddleware;
