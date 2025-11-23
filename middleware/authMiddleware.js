const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const secret = process.env.JWT_SECRET || 'secret_key_default_admin'; 
    const decoded = jwt.verify(token, secret);
    
    // Cek role Admin
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin only" });
    }

    req.admin = decoded; 
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};