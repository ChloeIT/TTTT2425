const { Role } = require("../generated/prisma");
const authService = require("../services/auth.service");
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
      if (
        role &&
        user.role === Role.BAN_GIAM_HIEU &&
        role !== Role.BAN_GIAM_HIEU
      ) {
        throw new Error("Không thể cập nhật vai trò cho người dùng này");
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
        throw new Error("Mật khẩu củ không chính xác");
      }

      const passwordHash = await authService.hashPassword(newPassword);

      await userService.updateNewPassword(req.user.id, passwordHash);

      await authService.expiredAllSession(user.id);

      //TODO: Thông báo email khi người dùng đổi mật khẩu thành công
      return res.status(200).json({
        message: "Đã đổi mật khẩu thành công. Vui lòng đăng nhập lại",
      });
    } catch (error) {
      next(error);
    }
  },

  getUsersPagination: async (req, res, next) => {
    try {
      const { query, page } = req.query;
      const { data, totalPage } = await userService.getUsers({
        page,
        query,
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

      //TODO: Thông báo ban giám hiệu khi tài khoản được active
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
      if (user.role === "BAN_GIAM_HIEU") {
        throw new Error("Không thể ngừng kích hoạt tài khoản người dùng này");
      }

      await userService.inactivateUser(userId);
      await authService.expiredAllSession(userId);

      //TODO: Thông báo ban giám hiệu khi tài khoản inactive
      return res.status(200).json({
        message: "Đã ngừng kích hoạt tài khoản người dùng thành công",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
