const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.body.token || req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user_id = decoded.user_id; // routes that use this can now access whatever was in the payload for this user
  } catch (err) {
    return res.status(401).send({ message: "Unauthorized!" });
  }
  return next();
};

module.exports = verifyToken;
