const authService = require("../services/auth.service");

const requireLogin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Cần đăng nhập để thực hiện" });
    }
    const user = await authService.verifySession(token);
    if (!user) {
      return res.status(401).json({ error: "Cần đăng nhập để thực hiện" });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Cần đăng nhập để thực hiện" });
  }
};
module.exports = requireLogin;
