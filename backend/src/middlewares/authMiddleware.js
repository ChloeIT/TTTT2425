const authService = require("../services/auth.service");

const requireLogin = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const user = await authService.verifySession(token);
    if (!user) {
      throw new Error("Unauthenticated");
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).send({ error: "Not authorized to access this resource" });
  }
};
module.exports = requireLogin;
