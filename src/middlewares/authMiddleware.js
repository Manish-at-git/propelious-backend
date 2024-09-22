const jwt = require("jsonwebtoken");
const { StatusMessage } = require("../utils/statusMessage");

const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers?.["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: StatusMessage.UNAUTHORIZED });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      });
    });

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ status: "403", error: StatusMessage.TOKEN_NOT_VALID });
  }
};

const authorizeUser = async (req, res, next) => {
  try {
    await verifyToken(req, res, next);
  } catch (error) {
    res.status(500).json({ error: StatusMessage.INTERNAL_SERVER_ERROR });
  }
};

module.exports = { verifyToken, authorizeUser };
