const express = require("express");
const authRoute = require("../controller/authRoute");
const routes = express.Router();
const controller = require("../controller/authRoute");

routes.post("/register", authRoute.register);

routes.post("/login", authRoute.login);

routes.post("/refresh-token", authRoute.refreshToken);

routes.delete("/logout", authRoute.logout);

module.exports = routes;
