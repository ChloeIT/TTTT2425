const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const moment = require("moment");
const userService = require("./user.service");

const TOKEN_EXPIRED_IN = 30 * 60;

const authService = {
  hashPassword: async (password) => {
    return await bcrypt.hash(password, 10);
  },
  matchPassword: async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword);
  },
  generateSession: async (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_KEY, {
      expiresIn: TOKEN_EXPIRED_IN,
    });
    const session = await prisma.session.create({
      data: {
        userId,
        token,
        expiredAt: moment().add(TOKEN_EXPIRED_IN, "seconds"),
      },
    });
    return session;
  },
  verifySession: async (token) => {
    const data = jwt.verify(token, process.env.JWT_KEY);

    const user = await prisma.user.findUnique({
      where: {
        id: data.userId,
        isActive: true,
        sessions: {
          some: {
            isExpired: false,
            token,
            expiredAt: {
              gt: new Date(),
            },
          },
        },
      },
      select: {
        ...userService.userSelect,
      },
    });

    return user;
  },

  findWithCredentials: async function ({ username, password }) {
    const user = await prisma.user.findUnique({
      where: { username, isActive: true },
    });
    if (!user) {
      throw new Error("username hoặc mật khẩu không hợp lệ");
    }
    const isMatch = await this.matchPassword(password, user.password);
    if (!isMatch) {
      throw new Error("username hoặc mật khẩu không hợp lệ");
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
};

module.exports = authService;
