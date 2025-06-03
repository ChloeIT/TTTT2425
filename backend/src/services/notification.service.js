const mail = require("../libs/mail");
const prisma = require("../libs/prisma");
const moment = require("moment");
const LIMIT = 10;
const notificationService = {
  getToday: () => {
    return moment().format("DD-MM-YYYY hh:mm");
  },
  sendNotificationMail: async (email, subject, message) => {
    await mail.sendMail({
      from: `<${process.env.GOOGLE_APP_ACCOUNT}>`,
      to: email,
      subject,
      text: message,
    });
  },
  createNotification: async ({ userId, message }) => {
    return await prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  },
  getNotificationPagination: async (userId, { page = 1 }) => {
    const [data, count] = await prisma.$transaction([
      prisma.notification.findMany({
        where: {
          userId,
        },
        take: LIMIT,
        skip: (page - 1) * LIMIT,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.notification.count({
        where: {
          userId,
        },
      }),
    ]);
    const totalPage = Math.ceil(count / LIMIT);
    return {
      data,
      totalPage,
    };
  },
  setIsReadNotifications: async (userId, notificationIds) => {
    return await prisma.notification.updateMany({
      where: {
        userId,
        id: {
          in: notificationIds,
        },
      },
      data: {
        isRead: true,
      },
    });
  },

  notifyLoginNewDevice: async function (userId, email) {
    const message = `Có phải bạn đã đăng nhập vào lúc ${this.getToday()}. Nếu không phải bạn, vui lòng kiểm tra lại`;
    await this.createNotification({
      userId,
      message,
    });
    await this.sendNotificationMail(
      email,
      "Đăng nhập trên thiết bị mới",
      message
    );
  },
  notifyChangePassword: async function (userId, email) {
    const message = `Bạn đã đổi mật khẩu đăng nhập vào lúc ${this.getToday()}. Nếu không phải bạn, vui lòng kiểm tra lại `;
    await this.createNotification({
      userId,
      message,
    });
    await this.sendNotificationMail(email, "Đổi mật khẩu", message);
  },
};

module.exports = notificationService;
