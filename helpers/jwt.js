const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("../helpers/redis");
// generating access token
module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      payload = {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };
      secretKey = process.env.ACCESS_KEY;
      option = {
        audience: userId,
        issuer: "thisweb.com",
      };

      jwt.sign(payload, secretKey, option, (error, token) => {
        if (error) {
          console.log(error);
          reject(createError.InternalServerError());
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];

    jwt.verify(token, process.env.ACCESS_KEY, (error, payload) => {
      if (error) {
        if (error.name === "jsonWebTokenError")
          return next(createError.Unauthorized());
        return next(createError.Unauthorized(error.message));
      }
      req.payload = payload;
      next();
    });
  },
  signRefreshToken: (userId) => {
    return new Promise((resolve, reject) => {
      payload = {
        //exp: Math.floor(Date.now() / 1000) + 60 * 60,
      };
      secretKey = process.env.ACCESS_KEY;
      option = {
        expiresIn: "1y",
        audience: userId,
        issuer: "thisweb.com",
      };

      jwt.sign(payload, secretKey, option, (error, token) => {
        if (error) {
          console.log(error);
          reject(createError.InternalServerError());
        }
        client.SET(userId, token, "EX", 365 * 24 * 60 * 60, (error, reply) => {
          if (error) {
            console.log(error);
            reject(createError.InternalServerError());
            return;
          }
          resolve(token);
        });
      });
    });
  },
  verifyRefereshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      jwt.verify(refreshToken, process.env.ACCESS_KEY, (error, payload) => {
        if (!refreshToken) return reject(createError.Unauthorized());
        const userId = payload.aud;

        client.GET(userId, (error, result) => {
          if (error) {
            console.log(error.message);
            reject(createError.InternalServerError());
            return;
          }
          if (result === refreshToken) return resolve(userId);
          reject(createError.Unauthorized());
        });
      });
    });
  },
};
