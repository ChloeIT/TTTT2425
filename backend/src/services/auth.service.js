const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const moment = require("moment");

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
    });

    return user;
  },

  findWithCredentials: async function ({ username, password }) {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return null;
    }
    const isMatch = await this.matchPassword(password, user.password);
    if (!isMatch) {
      return null;
    }
    return user;
  },
  findByUsername: async (username) => {
    return await prisma.user.findUnique({ where: { username } });
  },
  findByEmail: async (email) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  createNewUser: async ({
    fullName,
    username,
    email,
    password,
    department,
    role,
  }) => {
    const create = await prisma.user.create({
      data: {
        department,
        email,
        fullName,
        password,
        role,
        username,
      },
    });
    return create;
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
};

module.exports = authService;
