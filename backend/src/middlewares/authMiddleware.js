const authService = require("../services/auth.service");

const requireLogin = async (req, res, next) => {
  try {
    if (!req.header("Authorization")) {
      res.status(401).json({ error: "Cần đăng nhập để thực hiện" });
    }
    const token = req.header("Authorization").replace("Bearer ", "");

    const user = await authService.verifySession(token);
    if (!user) {
      res.status(401).json({ error: "Cần đăng nhập để thực hiện" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: "Cần đăng nhập để thực hiện" });
  }
};
module.exports = requireLogin;
