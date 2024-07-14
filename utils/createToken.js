import jwt from "jsonwebtoken";
import serverConfig from "../config/serverConfig.js";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, serverConfig.jwtSecretKey, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: serverConfig.node_env != "development",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
