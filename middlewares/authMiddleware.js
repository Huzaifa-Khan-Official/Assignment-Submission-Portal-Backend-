import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "../middlewares/asynHandler.js";
import serverConfig from "../config/serverConfig.js";

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //   token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, serverConfig.jwtSecretKey);

      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role == "admin") {
    next();
  } else {
    res.status(401).send("Not authorized as admin");
  }
};

const authorizeTrainer = (req, res, next) => {
  if (req.user && req.user.role == "trainer") {
    next();
  } else {
    res.status(401).send("Not authorized!");
  }
};

const authorizeTrainerORAdmin = (req, res, next) => {
  if (req.user && (req.user.role == "trainer" || req.user.role == "admin")) {
    next();
  } else {
    res.status(401).send("Not authorized!");
  }
};



export { authenticate, authorizeAdmin, authorizeTrainer, authorizeTrainerORAdmin };
