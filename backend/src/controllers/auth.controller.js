const authService = require("../services/auth.service");
const userService = require("../services/user.service");

const authController = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await authService.findWithCredentials({
        username,
        password,
      });
      const session = await authService.generateSession(user.id);

      return res.status(200).json({
        data: {
          user,
          session,
        },
        message: "Đã đăng nhập thành công",
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
        userService.findByUsername(username),
        userService.findByEmail(email),
      ]);
      if (usernameExist) {
        throw new Error("username đã được sử dụng");
      } else if (emailExist) {
        throw new Error("Địa chỉ email đã được sử dụng");
      }

      const hashPassword = await authService.hashPassword(password);
      const user = await userService.createNewUser({
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
        message: "Đã đăng ký người dùng mới thành công",
      });
    } catch (error) {
      next(error);
    }
  },
  currentUser: async (req, res, next) => {
    try {
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
      await authService.expiredSession(token);

      return res.status(200).json({
        message: "Đã đăng xuất tài khoản",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
