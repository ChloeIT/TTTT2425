const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authRoute = Router();

authRoute.post("/login", authController.login);

module.exports = authRoute;
