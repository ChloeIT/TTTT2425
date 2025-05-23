const authService = require("../services/auth.service");

const authController = {
  login: (req, res) => {
    // xu ly dang nhap

    authService.login();
  },
};

module.exports = authController;
