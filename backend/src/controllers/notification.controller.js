const notificationService = require("../services/notification.service");

const notificationController = {
  getNotifications: async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const { query } = req.query;

      const { data, totalPage, haveNotReadCount } =
        await notificationService.getNotificationPagination(req.user.id, {
          page,
          query,
        });

      notificationService.deleteNotifications(req.user.id);
      return res.status(200).json({
        data,
        totalPage,
        haveNotReadCount,
      });
    } catch (error) {
      next(error);
    }
  },
  updateReadNotifications: async (req, res, next) => {
    try {
      await notificationService.setIsReadNotifications(req.user.id);
      res.status(200).json({
        message: "Đã đánh dấu tất cả thông báo đã đọc",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
