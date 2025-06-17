const { Role } = require("../generated/prisma");
const { parseBoolean } = require("../libs/utils");
const authService = require("../services/auth.service");
const notificationService = require("../services/notification.service");
const userService = require("../services/user.service");

const userController = {
  editProfile: async (req, res, next) => {
    try {
      const { username, fullName } = req.body;
      if (username && req.user.username !== username) {
        const usernameExist = await userService.findByUsername(username);
        if (usernameExist) {
          throw new Error("Username đã được sử dụng");
        }
      }

      const user = await userService.updateUserProfile(req.user.id, {
        fullName,
        username,
      });
      return res.status(200).json({
        data: {
          user,
        },
        message: "Đã cập nhật thông tin người dùng thành công",
      });
    } catch (error) {
      next(error);
    }
  },
  editUser: async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const { role, department, email } = req.body;

      const user = await userService.findById(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }

      //kiểm tra email có phải là email mới, nếu mới có tồn tại trong db thì báo lỗi
      if (user.email !== email) {
        const emailExist = await userService.findByEmail(email);
        if (emailExist) {
          throw new Error("Email đã được sử dụng, vui lòng đổi email khác");
        }
      }

      // Ban giám hiệu có thể cập nhật vai trò của ban giám hiệu khác
      // mà không thể cập nhật vai trò của chính mình
      if (
        req.user.id == user.id &&
        user.role === Role.BAN_GIAM_HIEU &&
        role !== Role.BAN_GIAM_HIEU
      ) {
        throw new Error("Không thể cập nhật vai trò cho chính mình");
      }
      await userService.updateUser(userId, {
        department,
        email,
        role,
      });

      return res.status(200).json({
        message: "Đã cập nhật thông tin cho người dùng thành công",
      });
    } catch (error) {
      next(error);
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      const { newPassword, password } = req.body;

      const user = await userService.findByIdWithPassword(req.user.id);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      const isMatch = await authService.matchPassword(password, user.password);
      if (!isMatch) {
        throw new Error("Mật khẩu cũ không chính xác");
      }

      const passwordHash = await authService.hashPassword(newPassword);

      await userService.updateNewPassword(req.user.id, passwordHash);

      await authService.expiredAllSession(user.id);

      //TODO: Thông báo email khi người dùng đổi mật khẩu thành công
      notificationService.notifyChangePassword(user.id);

      return res.status(200).json({
        message: "Đã đổi mật khẩu thành công. Vui lòng đăng nhập lại",
      });
    } catch (error) {
      next(error);
    }
  },

  getUsersPagination: async (req, res, next) => {
    try {
      let { query } = req.query;
      const page = Number(req.query.page) || 1;
      const isActive = parseBoolean(req.query.isActive) ?? true;
      const { data, totalPage } = await userService.getUsers({
        page,
        query,
        isActive,
      });
      return res.status(200).json({
        data,
        totalPage,
      });
    } catch (error) {
      next(error);
    }
  },

  activeUser: async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const user = await userService.findById(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      await userService.activateUser(userId);

      return res.status(200).json({
        message: "Đã kích hoạt tài khoản người dùng thành công",
      });
    } catch (error) {
      next(error);
    }
  },
  inactiveUser: async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const user = await userService.findById(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      // cho phép ban giám hiệu ngừng kích hoạt tài khoản ban giám hiệu khác, nhưng
      //không thể ngừng kích hoạt tài khoản ban giám hiệu của mình
      if (req.user.id === user.id && user.role === "BAN_GIAM_HIEU") {
        throw new Error(
          "Không thể ngừng kích hoạt tài khoản người dùng của mình"
        );
      }

      await userService.inactivateUser(userId);
      await authService.expiredAllSession(userId);

      return res.status(200).json({
        message: "Đã ngừng kích hoạt tài khoản người dùng thành công",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
