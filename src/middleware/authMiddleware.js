import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // expects "Bearer <token>"
  if (!token) return res.status(401).json({ message: "Invalid token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid Token" });

    req.userId = decoded.userid; // must match the key used in jwt.sign()
    req.userRole = decoded.role;
    next();
  });
};
