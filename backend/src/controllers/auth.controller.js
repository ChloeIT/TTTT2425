const authService = require("../services/auth.service");

const authController = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await authService.findWithCredentials({
        username,
        password,
      });
      if (!user) {
        throw new Error({ error: "Invalid login credentials" });
      }
      const session = await authService.generateSession(user.id);
      return res.status(200).json({
        data: {
          user,
          session,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  register: async (req, res, next) => {
    try {
      const { fullName, username, email, password, department, role } =
        req.body;

      // username exist and email exist?
      const [usernameExist, emailExist] = await Promise.all([
        authService.findByUsername(username),
        authService.findByEmail(email),
      ]);
      if (usernameExist) {
        throw new Error("User in used");
      } else if (emailExist) {
        throw new Error("Email in used");
      }

      const hashPassword = await authService.hashPassword(password);
      const user = await authService.createNewUser({
        username,
        department,
        email,
        fullName,
        password: hashPassword,
        role,
      });
      return res.status(200).json({
        data: {
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  currentUser: async (req, res, next) => {
    try {
      if (!req.user || !req.token) {
        throw new Error("Unauthenticated");
      }

      return res.status(200).json({
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      const token = req.token;

      if (!token) {
        throw new Error("Unauthenticated");
      }
      const session = await authService.expiredSession(token);

      if (!session) {
        throw new Error("Unauthenticated");
      }

      return res.status(200).json({
        message: "User logout",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
