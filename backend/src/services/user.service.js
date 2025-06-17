const prisma = require("../libs/prisma");

const LIMIT = 10;

const userSelect = {
  id: true,
  fullName: true,
  username: true,
  email: true,
  department: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
};
const userService = {
  userSelect,

  findByUsername: async (username) => {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        ...userSelect,
      },
    });
  },
  findByEmail: async (email) => {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        ...userSelect,
      },
    });
  },
  findById: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        ...userSelect,
      },
    });
  },
  findByIdWithPassword: async (id) => {
    return await prisma.user.findUnique({
      where: { id },
    });
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
      select: {
        ...userSelect,
      },
    });
    return create;
  },
  updateNewPassword: async function (userId, newPassword) {
    const user = await prisma.user.update({
      data: {
        password: newPassword,
      },
      where: {
        id: userId,
      },
      select: {
        ...userSelect,
      },
    });
    return user;
  },
  getUsers: async ({ page = 1, query, isActive = true }) => {
    const [data, count] = await prisma.$transaction([
      prisma.user.findMany({
        take: LIMIT,
        skip: (page - 1) * LIMIT,
        where: {
          ...(query && {
            OR: [
              {
                fullName: {
                  contains: query,
                },
              },
              {
                email: {
                  contains: query,
                },
              },
            ],
          }),
          isActive,
        },
        select: {
          ...userSelect,
        },
      }),
      prisma.user.count({
        where: {
          ...(query && {
            OR: [
              {
                fullName: {
                  contains: query,
                },
              },
              {
                email: {
                  contains: query,
                },
              },
            ],
          }),
          isActive,
        },
      }),
    ]);
    const totalPage = Math.ceil(count / LIMIT);
    return {
      data,
      totalPage,
    };
  },
  updateUserProfile: async (userId, { fullName, username }) => {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName,
        username,
      },
      select: {
        ...userSelect,
      },
    });
  },
  updateUser: async (userId, { email, role, department }) => {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        email,
        role,
        department,
      },
      select: {
        ...userSelect,
      },
    });
  },

  activateUser: async (userId) => {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: true,
      },
    });
  },
  inactivateUser: async (userId) => {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isActive: false,
      },
    });
  },

  getAllUserWithRoleBanGiamHieu: async () => {
    return await prisma.user.findMany({
      where: {
        role: "BAN_GIAM_HIEU",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });
  },
};
module.exports = userService;
