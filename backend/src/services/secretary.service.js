const prisma = require("../libs/prisma");
const { decrypt } = require("../libs/encrypt");
const notificationService = require("./notification.service");
const userService = require("./user.service");
const {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} = require("date-fns");
const { Department, ExamStatus } = require("../generated/prisma");
const LIMIT = 10;

const secretaryService = {
  getExamsWithDecryptedPasswords: async ({
    page = 1,
    query,
    month,
    year,
    department,
  }) => {
    const where = {
      status: "DA_DUYET",
      password: {
        not: null,
      },
      ...(query && {
        title: {
          contains: query,
        },
      }),
      ...(department && {
        createdBy: {
          department,
        },
      }),
    };

    if (month && year) {
      const from = startOfMonth(new Date(year, month - 1));
      const to = endOfMonth(new Date(year, month - 1));
      where.createdAt = {
        gte: from,
        lte: to,
      };
    } else if (year) {
      const from = startOfYear(new Date(year, 0));
      const to = endOfYear(new Date(year, 0));
      where.createdAt = {
        gte: from,
        lte: to,
      };
    }

    const [exams, count] = await prisma.$transaction([
      prisma.exam.findMany({
        where,
        include: {
          createdBy: {
            select: {
              fullName: true,
              email: true,
              department: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * LIMIT,
        take: LIMIT,
      }),
      prisma.exam.count({ where }),
    ]);

    const examsWithDecryptedPasswords = exams.map((exam) => {
      const { password, ...rest } = exam;
      return {
        ...rest,
        decryptedPassword: password ? decrypt(password) : null,
      };
    });

    const totalPage = Math.ceil(count / LIMIT);

    return {
      data: examsWithDecryptedPasswords,
      totalPage,
    };
  },

  validateQuerySignedExam: (req) => {
    let { query, department, month, year, status } = req.query;
    const page = Number(req.query.page) || 1;

    // Validate department
    if (!Object.values(Department).includes(department)) {
      department = undefined;
    }

    // Validate month
    const parsedMonth = parseInt(month);
    if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      month = undefined;
    } else {
      month = parsedMonth;
    }

    // Validate year (trong vòng 10 năm từ hiện tại)
    const currentYear = new Date().getFullYear();
    const parsedYear = parseInt(year);
    if (
      isNaN(parsedYear) ||
      parsedYear < currentYear - 10 ||
      parsedYear > currentYear
    ) {
      year = undefined;
    } else {
      year = parsedYear;
    }

    return {
      query,
      department,
      month,
      year,
      page,
    };
  },
  // getExamsWithEncryptedPasswords: async () => {
  //   const exams = await prisma.exam.findMany({
  //     where: {
  //       status: "DA_DUYET",
  //       password: {
  //         not: null,
  //       },
  //     },
  //     include: {
  //       createdBy: {
  //         select: {
  //           fullName: true,
  //           email: true,
  //           department: true,
  //           username: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //   });

  //   const examsWithEncryptedPasswords = exams.map((exam) => ({
  //     ...exam,
  //     encryptedPassword: exam.password,
  //   }));

  //   return examsWithEncryptedPasswords;
  // },

  getAllUserEmails: async () => {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        department: true,
      },
    });

    const groupedEmails = {};

    users.forEach((user) => {
      if (user.email && user.department) {
        if (!groupedEmails[user.department]) {
          groupedEmails[user.department] = [];
        }
        // Thêm email của người dùng vào mảng email của department tương ứng
        groupedEmails[user.department].push(user.email);
      }
    });

    return groupedEmails;
  },

  notifyUserByEmail: async (email, password, titleExam) => {
    const user = await userService.findByEmail(email);
    if (!user) {
      throw new Error(`User với email ${email} không tồn tại`);
    }

    const title = `Thông báo mật khẩu đề thi ${titleExam}`;
    const message = `Bạn nhận được mật khẩu đề thi: ${password}. Vui lòng bảo mật thông tin này.`;

    // Tạo notification trong DB và gửi mail
    await notificationService.createNotificationAndSendMail({
      userId: user.id,
      title,
      message,
    });
  },
};

module.exports = secretaryService;
