const authService = require("../services/auth.service");
const userService = require("../services/user.service");

const userController = {
  updateUser: async (req, res, next) => {
    try {
      const { username, email } = req.body;
      if (username && req.user.username !== username) {
        const usernameExist = await userService.findByUsername(username);
        if (usernameExist) {
          throw new Error("username đã được sử dụng");
        }
      }
      if (email && req.user.email !== email) {
        const emailExist = await userService.findByEmail(email);
        if (emailExist) {
          throw new Error("Địa chỉ email đã được sử dụng");
        }
      }

      const currentUser = await userService.findById(req.user.id);
      if (!currentUser) {
        throw new Error("Người dùng không tồn tại");
      }

      const user = await userService.updateUser(currentUser.id, {
        ...req.body,
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
  resetPassword: async (req, res, next) => {
    try {
      const { newPassword, password } = req.body;

      const user = await userService.findByIdWithPassword(req.user.id);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      const isMatch = await authService.matchPassword(password, user.password);
      if (!isMatch) {
        throw new Error("Mật khẩu hiện tại đã nhập không chính xác");
      }

      const passwordHash = await authService.hashPassword(newPassword);

      await userService.resetPassword(req.user.id, passwordHash);

      await authService.expiredAllSession(user.id);
      return res.status(200).json({
        message: "Đã đổi mật khẩu thành công",
      });
    } catch (error) {
      next(error);
    }
  },

  getUserTable: async (req, res, next) => {
    try {
      const { q, page } = req.query;
      const { data, totalPage } = await userService.getUsers({
        page,
        query: q,
      });
      return res.status(200).json({
        data: {
          data,
          totalPage,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  editRole: async (req, res, next) => {
    try {
      const userId = Number(req.params.id);
      const { role } = req.body;

      const user = await userService.findById(userId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
      if (user.role == "BAN_GIAM_HIEU") {
        throw new Error("Không thể cập nhật vai trò cho người dùng này");
      }
      await userService.updateUserRole(userId, role);

      return res.status(200).json({
        message: "Đã cập nhật vai trò cho người dùng thành công",
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
      await userService.activeUser(userId);
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
      if (user.role == "BAN_GIAM_HIEU") {
        throw new Error("Không thể ngừng kích hoạt tài khoản người dùng này");
      }

      await userService.inactiveUser(userId);
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
