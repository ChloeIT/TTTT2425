const authService = require("../services/auth.service");
const notificationService = require("../services/notification.service");
const userService = require("../services/user.service");

const authController = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await authService.findWithCredentials({
        username,
        password,
      });

      const deviceId = req.cookies["deviceId"];

      //TODO: Kiểm tra đăng nhập có phải cùng một thiết bị hay không
      // nếu khác có thể gửi email thông báo đã đăng nhập
      const isNewDevice = await authService.checkSessionIsNewDevice(
        user.id,
        deviceId
      );
      if (isNewDevice) {
        notificationService.notifyLoginNewDevice(user.id, user.email);
      }
      const session = await authService.generateSession(user.id, deviceId);

      return res.status(200).json({
        data: {
          user,
          session,
        },
        message: "Đã đăng nhập thành công",
      });
    } catch (error) {
      console.log(error);

      next(error);
    }
  },

  register: async (req, res, next) => {
    try {
      const { fullName, username, email, password, department, role } = req.body;

      // username exist and email exist?
      const [usernameExist, emailExist] = await Promise.all([
        userService.findByUsername(username),
        userService.findByEmail(email),
      ]);
      console.log(usernameExist)
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

      return res.status(201).json({
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
  createForgotPasswordOtp: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await userService.findByEmail(email);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      const forgotPassword = await authService.createForgotPasswordOtp(
        user.id,
        user.email
      );
      return res.status(200).json({
        data: {
          token: forgotPassword.token,
        },
        message: "Đã gửi mã OTP đến email của người dùng",
      });
    } catch (error) {
      next(error);
    }
  },
  verifyForgotPasswordToken: async (req, res, next) => {
    try {
      const { token } = req.query;
      if (!token) {
        throw new Error(
          "Token để thực hiện chức năng quên mật khẩu đã quá hạn hoặc không hợp lệ"
        );
      }
      const existForgotPassword = await authService.verifyForgotPasswordToken(
        token
      );
      if (!existForgotPassword) {
        throw new Error(
          "Token để thực hiện chức năng quên mật khẩu đã quá hạn hoặc không hợp lệ"
        );
      }
      return res.status(200).json({
        data: {
          token: existForgotPassword.token,
        },
        message: "Token của người dùng hợp lệ",
      });
    } catch (error) {
      next(error);
    }
  },
  resetForgotPassword: async (req, res, next) => {
    try {
      const { token } = req.query;
      const { otp, newPassword } = req.body;
      if (!token) {
        throw new Error(
          "Token để thực hiện chức năng quên mật khẩu đã quá hạn hoặc không hợp lệ"
        );
      }

      const verifyToken = await authService.verifyForgotPasswordToken(token);
      if (!verifyToken) {
        throw new Error(
          "Token để thực hiện chức năng quên mật khẩu đã quá hạn hoặc không hợp lệ"
        );
      }

      const existForgotPassword = await authService.verifyForgotPasswordOtp(
        verifyToken.id,
        otp
      );
      if (!existForgotPassword) {
        throw new Error("Mã OTP không đúng hoặc đã hết hạn");
      }
      const forgotPassword = await authService.updateForgotPasswordOtp(
        existForgotPassword.id
      );

      const passwordHash = await authService.hashPassword(newPassword);

      await userService.updateNewPassword(forgotPassword.userId, passwordHash);

      await authService.expiredAllSession(forgotPassword.userId);
      return res.status(200).json({
        message: "Đã đổi mật khẩu thành công.",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
