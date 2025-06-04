const notificationService = require("../services/notification.service");

const notificationController = {
  getNotifications: async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;

      const { data, totalPage } =
        await notificationService.getNotificationPagination(req.user.id, {
          page,
        });
      return res.status(200).json({
        data,
        totalPage,
      });
    } catch (error) {
      next(error);
    }
  },
  updateReadNotifications: async (req, res, next) => {
    try {
      const { ids } = req.body;

      await notificationService.setIsReadNotifications(req.user.id, ids);
      res.status(200).json({
        message: "Đã đánh dấu thông báo đã đọc",
      });
    } catch (error) {
      console.log(error);

      next(error);
    }
  },
};

module.exports = notificationController;
