const prisma = require("../libs/prisma");
const { encrypt, decrypt } = require("../libs/encrypt");
const notificationService = require("./notification.service");
const {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} = require("date-fns");
const { Department, ExamStatus } = require("../generated/prisma");
const LIMIT = 10;

const examService = {
  createExam: async ({
    title,
    status,
    createdById,
    questionFile,
    answerFile,
  }) => {
    // Correctly extract base URL
    const extractBaseUrl = (signedUrl) => {
      try {
        const url = new URL(signedUrl);
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "drujd0cbj";
        const pathParts = url.pathname.split("/");
        let adjustedPathParts = pathParts.filter((part) => part);
        if (adjustedPathParts[0] === cloudName) {
          adjustedPathParts = adjustedPathParts.slice(1);
        }
        adjustedPathParts = adjustedPathParts.filter(
          (part) =>
            !part.startsWith("s--") &&
            !part.startsWith("v") &&
            part !== "upload" &&
            part !== "raw"
        );
        const publicIdPath = adjustedPathParts.join("/");
        return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicIdPath}`;
      } catch (error) {
        throw new Error("Invalid URL format");
      }
    };

    const baseQuestionFile = extractBaseUrl(questionFile);
    const baseAnswerFile = extractBaseUrl(answerFile);

    // Gửi thông báo
    const bghUsers = await prisma.user.findMany({
      where: {
        role: "BAN_GIAM_HIEU",
      },
    });

    const titleNotify = `Thông báo đề thi ${title} đã được soạn`;
    const messageNotify = `Đề thi "${title}" đã được gửi .`;

    await Promise.all(
      bghUsers.map((user) =>
        notificationService.createNotificationAndSendMail({
          userId: user.id,
          title: titleNotify,
          message: messageNotify,
        })
      )
    );

    return await prisma.exam.create({
      data: {
        title,
        status,
        createdById,
        questionFile: baseQuestionFile,
        answerFile: baseAnswerFile,
      },
    });
  },
  //ds bai thi theo user
  getExamsByUserId: async (userId) => {
    return await prisma.exam.findMany({
      where: { createdById: userId },
      include: { createdBy: true },
    });
  },

  getAllExams: async ({ status } = {}) => {
    return await prisma.exam.findMany({
      where: status ? { status } : {},
      include: {
        createdBy: {
          select: {
            username: true,
            fullName: true,
            email: true,
            department: true,
          },
        },
        document: true, // Include the document relation
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getExamById: async (id) => {
    return await prisma.exam.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        questionFile: true,
        answerFile: true,
      },
    });
  },

  getExamWithMetaById: async (id) => {
    return await prisma.exam.findUnique({
      where: { id },
      include: { createdBy: true },
    });
  },

  updateExamStatus: async (id, status) => {
    return await prisma.exam.update({
      where: { id },
      data: { status },
    });
  },

  deleteExam: async (id) => {
    return await prisma.exam.delete({
      where: { id },
    });
  },

  approveExam: async (id, rawPassword, userId) => {
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      throw new Error("Không tìm thấy đề thi");
    }

    if (existingExam.status !== "DANG_CHO") {
      throw new Error("Đề thi không hợp lệ");
    }

    const encryptedPassword = encrypt(rawPassword);

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: "DA_DUYET",
        password: encryptedPassword,
        updatedAt: new Date(),
      },
    });

    notificationService.notifyApproveExam(
      updatedExam.createdById,
      updatedExam.title
    );

    const { password, ...examWithoutPassword } = updatedExam;

    return examWithoutPassword;
  },
  rejectExam: async (id, message, userId) => {
    const existingExam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      throw new Error("Không tìm thấy đề thi");
    }

    if (existingExam.status !== "DANG_CHO") {
      throw new Error("Đề thi không hợp lệ");
    }

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: "TU_CHOI",
        note: message,
        updatedAt: new Date(),
      },
    });

    const { password, ...examWithoutPassword } = updatedExam;

    return examWithoutPassword;
  },
  verifyPassword: async (examId, inputPassword) => {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });
    if (!exam) return false;

    const decryptedPassword = decrypt(exam.password);
    return decryptedPassword === inputPassword;
  },

  changeStatus: async (id, changeStatus) => {
    console.log(id);
    console.log(changeStatus);
    // Cập nhật trạng thái sang DA_THI
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: changeStatus,
        updatedAt: new Date(),
      },
    });
    notificationService.notifyOpenExam(
      updatedExam.createdById,
      updatedExam.title
    );

    // Tạo thông báo mở đề
    // notificationService.notifyOpenExam(userId, exam.title);

    return {
      id: updatedExam.id,
      title: updatedExam.title,
      questionFile: updatedExam.questionFile,
    };
  },
  openExam: async (id, userId) => {
    // Kiểm tra trạng thái phải là DA_DUYET
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam || exam.status !== "DA_DUYET") {
      throw new Error("Đề thi chưa duyệt hoặc đã mở");
    }

    // Cập nhật trạng thái sang DA_THI
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: "DA_THI",
        updatedAt: new Date(),
      },
    });

    // Nếu sau này bạn muốn lưu đề vào Document, hãy bật phần này lên:
    /*
    await prisma.document.create({
      data: {
        questionFile: exam.questionFile,
        answerFile: exam.answerFile,
        examId: id,
        createdAt: new Date(),
      },
    });
    */

    // Tạo thông báo mở đề
    notificationService.notifyOpenExam(userId, exam.title);

    return {
      id: updatedExam.id,
      title: updatedExam.title,
      questionFile: exam.questionFile,
    };
  },

  updateExamDocument: async (id, { questionFile, answerFile }) => {
    // Extract base URLs
    const extractBaseUrl = (signedUrl) => {
      try {
        const url = new URL(signedUrl);
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "drujd0cbj";
        const pathParts = url.pathname.split("/");
        let adjustedPathParts = pathParts.filter((part) => part);
        if (adjustedPathParts[0] === cloudName) {
          adjustedPathParts = adjustedPathParts.slice(1);
        }
        adjustedPathParts = adjustedPathParts.filter(
          (part) =>
            !part.startsWith("s--") &&
            !part.startsWith("v") &&
            part !== "upload" &&
            part !== "raw"
        );
        const publicIdPath = adjustedPathParts.join("/");
        return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicIdPath}`;
      } catch (error) {
        throw new Error("Invalid URL format");
      }
    };

    const baseQuestionFile = extractBaseUrl(questionFile);
    const baseAnswerFile = extractBaseUrl(answerFile);

    // Create or update document and link to exam
    const updatedExam = await prisma.$transaction(async (tx) => {
      // Check if document exists and update, or create new
      let document = await tx.document.findUnique({ where: { examId: id } });
      if (document) {
        document = await tx.document.update({
          where: { examId: id },
          data: {
            questionFile: baseQuestionFile,
            answerFile: baseAnswerFile,
            createdAt: new Date(),
          },
        });
      } else {
        document = await tx.document.create({
          data: {
            questionFile: baseQuestionFile,
            answerFile: baseAnswerFile,
            examId: id,
            createdAt: new Date(),
          },
        });
      }

      // Link document to exam
      return await tx.exam.update({
        where: { id },
        data: { document: { connect: { id: document.id } } },
        include: { document: true },
      });
    });

    return updatedExam;
  },

  getExamsByStatus: async ({
    page = 1,
    status,
    query,
    department,
    month,
    year,
  }) => {
    const where = {
      ...(query && {
        title: {
          contains: query,
        },
      }),
      ...(status && {
        status,
      }),
      ...(department && {
        createdBy: {
          department,
        },
      }),
    };

    if (month && year) {
      const from = startOfMonth(new Date(year, month - 1)); // month - 1 vì JS month bắt đầu từ 0
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

    const [data, count] = await prisma.$transaction([
      prisma.exam.findMany({
        take: LIMIT,
        skip: (page - 1) * LIMIT,
        where,
        select: {
          id: true,
          title: true,
          questionFile: true,
          answerFile: true,
          createdAt: true,
          updatedAt: true,
          note: true,
          status: true,
          createdById: true,
          createdBy: {
            select: {
              username: true,
              fullName: true,
              email: true,
              department: true,
            },
          },
        },
      }),
      prisma.exam.count({
        where,
      }),
    ]);
    const totalPage = Math.ceil(count / LIMIT);

    return {
      data,
      totalPage,
    };
  },
  validateQueryGetExamsByStatus: (req) => {
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
      status,
      page,
    };
  },
};

module.exports = examService;
