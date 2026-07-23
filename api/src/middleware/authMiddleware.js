import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid Token" });

    req.userId = decoded.userid;
    req.userRole = decoded.role;
    next();
  });
};

export const requireReviewer = (req, res, next) => {
  if (req.userRole !== "REVIEWER") {
    return res.status(403).json({ message: "Forbidden: reviewers only" });
  }
  next();
};
