const mail = require("../libs/mail");
const prisma = require("../libs/prisma");
const moment = require("moment");
const userService = require("./user.service");
const LIMIT = 10;

const departmentMap = {
  MAC_DINH: "Mặc định",
  LY_LUAN_CO_SO: "Lý luận cơ sở",
  NHA_NUOC_PHAP_LUAT: "Nhà nước và pháp luật",
  XAY_DUNG_DANG: "Xây dựng Đảng",
};

const notificationService = {
  getToday: () => {
    return moment().format("DD-MM-YYYY hh:mm");
  },

  sendNotificationMail: async (userId, subject, message) => {
    const user = await userService.findById(userId);
    if (!user) {
      return; // User not found
    }

    try {
      await mail.sendMail({
        from: `<${process.env.GOOGLE_APP_ACCOUNT}>`,
        to: user.email,
        subject,
        text: message,
      });
    } catch (error) {
      console.log("Lỗi gửi mail");
    }
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

  createNotificationAndSendMail: async function ({ userId, title, message }) {
    await this.createNotification({ userId, title, message });
    await this.sendNotificationMail(userId, title, message);
  },

  getNotificationPagination: async (userId, { page = 1 }) => {
    const [data, count, haveNotReadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where: { userId },
        take: LIMIT,
        skip: (page - 1) * LIMIT,
        orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
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
      where: { userId },
      data: { isRead: true },
    });
  },

  notifyLoginNewDevice: async function (userId) {
    const message = `Có phải bạn đã đăng nhập vào lúc ${this.getToday()}. Nếu không phải bạn, vui lòng kiểm tra lại`;
    const title = "Đăng nhập trên thiết bị mới";
    await this.createNotification({ userId, title, message });
    await this.sendNotificationMail(userId, title, message);
  },

  notifyChangePassword: async function (userId) {
    const message = `Bạn đã đổi mật khẩu đăng nhập vào lúc ${this.getToday()}. Nếu không phải bạn, vui lòng kiểm tra lại `;
    const title = "Đổi mật khẩu";
    await this.createNotification({ userId, title, message });
    await this.sendNotificationMail(userId, title, message);
  },

  notifyApproveExam: async function (userId, examTitle) {
    const title = `Đề thi ${examTitle} đã được duyệt`;
    const message = `Đề thi của bạn đã được ban giám hiệu duyệt vào lúc ${this.getToday()}`;
    await this.createNotification({ userId, title, message });
    await this.sendNotificationMail(userId, title, message);
  },

  notifyOpenExam: async function (userId, examTitle, fullName, department) {
    const title = `Đề thi ${examTitle} đã được mở`;
    const message = `Đề thi ${examTitle} đã được mở vào lúc ${this.getToday()} bởi GV  ${fullName} - ${
      departmentMap[department]
    }`;

    // Thông báo cho người mở đề
    await this.createNotification({ userId, title, message });
    await this.sendNotificationMail(userId, title, message);

    // Lấy danh sách ban giám hiệu
    const usersBanGiamHieu = await userService.getAllUserWithRoleBanGiamHieu();

    // Thông báo cho tất cả ban giám hiệu
    await Promise.all(
      usersBanGiamHieu.map((user) => {
        return this.createNotification({ userId: user.id, title, message });
      })
    );
  },

  notifyRejectExam: async function (userId, examTitle, reason) {
    const title = `Đề thi ${examTitle} bị từ chối`;
    const message = `Đề thi của bạn đã bị từ chối vào lúc ${this.getToday()}. Lý do: ${reason}`;
    await this.createNotification({
      userId,
      title,
      message,
    });
    await this.sendNotificationMail(userId, title, message);
  },

  notifyOpenAnswer: async function (userId, examTitle, fullName, department) {
    const title = `Đáp án đề thi ${examTitle} đã được mở`;
    const message = `Đáp án của đề thi ${examTitle} đã được mở vào lúc ${this.getToday()} bởi GV ${fullName} - ${
      departmentMap[department]
    }`;

    await this.createNotification({ userId, title, message });
    await this.sendNotificationMail(userId, title, message);

    const usersBanGiamHieu = await userService.getAllUserWithRoleBanGiamHieu();
    await Promise.all(
      usersBanGiamHieu.map((user) =>
        this.createNotification({ userId: user.id, title, message })
      )
    );
  },
};

module.exports = notificationService;
