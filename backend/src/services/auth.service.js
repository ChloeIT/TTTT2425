const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const moment = require("moment");
const userService = require("./user.service");
const mail = require("../libs/mail");

const TOKEN_EXPIRED_IN = 60 * 60;
const MAX_ATTEMPT_COUNT = 5;

const authService = {
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  },
  matchPassword: async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword);
  },
  generateSession: async (userId, deviceId) => {
    const token = jwt.sign({ userId }, process.env.JWT_KEY, {
      expiresIn: TOKEN_EXPIRED_IN,
    });
    const session = await prisma.session.create({
      data: {
        userId,
        token,
        expiredAt: moment().add(TOKEN_EXPIRED_IN, "seconds"),
        deviceId,
      },
    });
    return session;
  },
  checkSessionIsNewDevice: async (userId, deviceId) => {
    if (!deviceId) {
      // thiết bị không xác định → xem như mới
      return true;
    }
    const session = await prisma.session.findFirst({
      where: {
        deviceId,
        userId,
      },
    });
    return session ? false : true;
  },
  verifySession: async (token) => {
    const data = jwt.verify(token, process.env.JWT_KEY);

    const session = await prisma.session.findUnique({
      where: {
        isExpired: false,
        token,
        expiredAt: {
          gt: new Date(),
        },
        userId: data.userId,
      },
      include: {
        user: {
          select: {
            ...userService.userSelect,
          },
        },
      },
    });
    return session?.user;
  },

  findWithCredentials: async function ({ username, password }) {
    let user = await prisma.user.findUnique({
      where: { username, isActive: true },
    });
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email: username, isActive: true },
      });
    }
    if (!user) {
      throw new Error("Tài khoản hoặc mật khẩu không hợp lệ");
    }
    const isMatch = await this.matchPassword(password, user.password);
    if (!isMatch) {
      throw new Error("Tài khoản hoặc mật khẩu không hợp lệ");
    }
    const { password: pw, ...other } = user;
    return other;
  },

  expiredSession: async (token) => {
    const session = await prisma.session.update({
      where: {
        token,
      },
      data: {
        isExpired: true,
      },
    });
    return session;
  },
  expiredAllSession: async (userId) => {
    return await prisma.session.updateMany({
      where: {
        userId,
      },
      data: {
        isExpired: true,
      },
    });
  },

  generateOTP: () => {
    return Math.floor(100000 + Math.random() * 900000);
  },

  sendEmailForgotPasswordOtp: async (email, otp) => {
    await mail.sendMail({
      from: `<${process.env.GOOGLE_APP_ACCOUNT}>`,
      to: email,
      subject: "Quên mật khẩu",
      text: `Mã OTP của bạn là ${otp} sẽ có hiệu lực trong vòng 5 phút`,
    });
  },
  createForgotPasswordOtp: async function (userId, email) {
    const oldForgotPassword = await prisma.forgotPassword.findFirst({
      where: {
        userId,
        expiredAt: {
          gt: new Date(),
        },
      },
    });
    if (oldForgotPassword) {
      // not send email
      throw new Error(
        "Không thể thực hiện chức năng quên mật khẩu liên tục trong một thời gian ngắn"
      );
    }
    const forgotPassword = await prisma.forgotPassword.create({
      data: {
        userId,
        otp: this.generateOTP().toString(),
        expiredAt: moment().add(5, "minutes"),
      },
    });

    this.sendEmailForgotPasswordOtp(email, forgotPassword.otp);
    // send otp  to user
    return forgotPassword;
  },
  verifyForgotPasswordToken: async function (token) {
    const forgotPassword = await prisma.forgotPassword.findUnique({
      where: {
        token,
        expiredAt: {
          gt: new Date(),
        },
        isActive: true,
        attemptCount: {
          lt: MAX_ATTEMPT_COUNT,
        },
      },
    });
    return forgotPassword;
  },
  verifyForgotPasswordOtp: async function (id, otp) {
    const forgotPassword = await prisma.forgotPassword.findUnique({
      where: {
        id,
        otp,
      },
    });
    if (!forgotPassword) {
      await prisma.forgotPassword.update({
        where: {
          id,
        },
        data: {
          attemptCount: {
            increment: 1,
          },
        },
      });
    }
    return forgotPassword;
  },
  updateForgotPasswordOtp: async (id) => {
    const updatedForgotPassword = await prisma.forgotPassword.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      include: {
        user: {
          select: {
            ...userService.userSelect,
          },
        },
      },
    });
    return updatedForgotPassword;
  },
};

module.exports = authService;
