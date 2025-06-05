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
  createNotification: async ({ userId, title, message }) => {
    return await prisma.notification.create({
      data: {
        userId,
        message,
        title,
      },
    });
  },
  getNotificationPagination: async (userId, { page = 1 }) => {
    const [data, count, haveNotReadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: {
          userId,
        },
        take: LIMIT,
        skip: (page - 1) * LIMIT,
        orderBy: [
          {
            isRead: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      }),
      prisma.notification.count({
        where: {
          userId,
        },
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);
    const totalPage = Math.ceil(count / LIMIT);
    return {
      data,
      totalPage,
      haveNotReadCount,
    };
  },
  setIsReadNotifications: async (userId) => {
    return await prisma.notification.updateMany({
      where: {
        userId,
      },
      data: {
        isRead: true,
      },
    });
  },

  notifyLoginNewDevice: async function (userId, email) {
    const message = `Có phải bạn đã đăng nhập vào lúc ${this.getToday()}. Nếu không phải bạn, vui lòng kiểm tra lại`;
    const title = "Đăng nhập trên thiết bị mới";
    await this.createNotification({
      userId,
      title,
      message,
    });
    await this.sendNotificationMail(email, title, message);
  },
  notifyChangePassword: async function (userId, email) {
    const message = `Bạn đã đổi mật khẩu đăng nhập vào lúc ${this.getToday()}. Nếu không phải bạn, vui lòng kiểm tra lại `;
    const title = "Đổi mật khẩu";
    await this.createNotification({
      userId,
      title,
      message,
    });
    await this.sendNotificationMail(email, title, message);
  },
};

module.exports = notificationService;
