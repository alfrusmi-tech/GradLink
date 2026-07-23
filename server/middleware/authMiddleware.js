import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    const authorizationHeader = req.headers.authorization;

    if (
      authorizationHeader &&
      authorizationHeader.startsWith("Bearer ")
    ) {
      token = authorizationHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. No token provided.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(401).json({
        message: "User belonging to this token no longer exists.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Your account has been disabled.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your login session has expired. Please log in again.",
      });
    }

    return res.status(401).json({
      message: "Invalid authentication token.",
    });
  }
};