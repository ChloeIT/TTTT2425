const prisma = require("../libs/prisma");
const { encrypt, decrypt } = require("../libs/encrypt");
const notificationService = require("./notification.service");
const {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subMinutes,
} = require("date-fns");
const { Department, ExamStatus } = require("../generated/prisma");
const { cloudinary } = require("../libs/cloudinary");
const LIMIT = 10;
const MAX_EXAM_OPEN_COUNT = 3;

const examService = {
  createExam: async ({
    title,
    status,
    createdById,
    questionFile,
    answerFile,
  }) => {
    const questionFileUrl = new URL(questionFile);
    const answerFileUrl = new URL(answerFile);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "drujd0cbj";
    const basePath = `https://res.cloudinary.com/${cloudName}/raw/upload/`;

    const baseQuestionFile =
      basePath + questionFileUrl.pathname.split("/").slice(3).join("/");
    const baseAnswerFile =
      basePath + answerFileUrl.pathname.split("/").slice(3).join("/");

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

  getPendingExamsByUserId: async ({ userId, query = "" }) => {
    return await prisma.exam.findMany({
      where: {
        createdById: userId,
        status: "DANG_CHO",
        ...(query && {
          title: {
            contains: query,
            mode: "insensitive",
          },
        }),
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getRejectedExamsByUserId: async ({ userId, query = "" }) => {
    return await prisma.exam.findMany({
      where: {
        createdById: userId,
        status: "TU_CHOI",
        ...(query && {
          title: {
            contains: query,
            mode: "insensitive",
          },
        }),
      },
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
      orderBy: {
        updatedAt: "desc",
      },
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
        document: true,
        attemptCount: true,
        openAt: true,
        status: true,
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

  deleteExam: async (id, questionFile, answerFile, userId) => {
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { status: true, createdById: true },
    });

    if (!exam) {
      throw new Error("Không tìm thấy đề thi");
    }

    // Kiểm tra trạng thái và quyền sở hữu
    if (exam.status !== "DANG_CHO" && exam.status !== "TU_CHOI") {
      throw new Error(
        "Chỉ có thể xóa đề thi ở trạng thái ĐANG CHỜ hoặc TỪ CHỐI"
      );
    }
    if (exam.createdById !== userId) {
      throw new Error("Bạn chỉ có thể xóa đề thi do chính bạn tạo");
    }

    // Extract public IDs for Cloudinary deletion
    const extractPublicId = (url) => {
      const parts = url.split("/");
      const fileNameWithExt = parts.pop(); // e.g., "1749287013182_pdf.pdf"
      const folderPath = parts.slice(parts.indexOf("exam_files")).join("/"); // e.g., "exam_files"
      return `${folderPath}/${fileNameWithExt}`; // e.g., "exam_files/1749287013182_pdf.pdf"
    };

    const questionFilePublicId = extractPublicId(questionFile);
    const answerFilePublicId = extractPublicId(answerFile);

    // Delete files from Cloudinary
    await Promise.all([
      cloudinary.uploader.destroy(questionFilePublicId, {
        resource_type: "raw",
      }),
      cloudinary.uploader.destroy(answerFilePublicId, { resource_type: "raw" }),
    ]).catch((error) => {
      console.error("Error deleting files from Cloudinary:", error);
    });

    // Delete the exam record from the database
    await prisma.exam.delete({
      where: { id },
    });
  },

  deleteExamDocument: async (id) => {
    const exam = await prisma.exam.findUnique({
      where: { id },
      include: { document: true },
    });

    if (!exam || !exam.document) {
      throw new Error("Đề thi không có tài liệu để xóa");
    }

    // Extract public IDs for Cloudinary deletion
    const extractPublicId = (url) => {
      const parts = url.split("/");
      const fileNameWithExt = parts.pop(); // e.g., "1749287013182_pdf.pdf"
      const folderPath = parts.slice(parts.indexOf("exam_files")).join("/"); // e.g., "exam_files"
      return `${folderPath}/${fileNameWithExt}`; // e.g., "exam_files/1749287013182_pdf.pdf"
    };

    const questionFilePublicId = extractPublicId(exam.document.questionFile);
    const answerFilePublicId = extractPublicId(exam.document.answerFile);

    await Promise.all([
      cloudinary.uploader.destroy(questionFilePublicId, {
        resource_type: "raw",
      }),
      cloudinary.uploader.destroy(answerFilePublicId, { resource_type: "raw" }),
    ]).catch((error) => {
      console.error("Error deleting files from Cloudinary:", error);
    });

    // Delete the document record from the database
    await prisma.document.delete({
      where: { examId: id },
    });

    // Update the exam to remove the document reference using disconnect
    // await prisma.exam.update({
    //   where: { id },
    //   data: {
    //     document: {
    //       disconnect: true, // This removes the relationship without setting document to null
    //     },
    //   },
    // });
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

    if (
      existingExam.status !== "DANG_CHO" &&
      existingExam.status !== "DA_DUYET"
    ) {
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

    // Gửi thông báo và email bằng notificationService
    notificationService.notifyRejectExam(
      updatedExam.createdById,
      updatedExam.title,
      message
    );

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

  canOpenExam: async (examId) => {
    const cutoffTime = subMinutes(new Date(), 180);
    const examIsValid = await prisma.exam.findUnique({
      where: {
        id: examId,
        OR: [
          {
            status: "DA_DUYET",
          },
          {
            status: "DA_THI",
            attemptCount: { lt: MAX_EXAM_OPEN_COUNT },
            openAt: {
              gte: cutoffTime, // mở rồi nhưng vẫn trong 180 phút
            },
          },
        ],
      },
    });
    return examIsValid;
  },

  openExam: async (exam, user) => {
    // if (!exam || exam.status !== "DA_DUYET") {
    //   throw new Error("Đề thi chưa duyệt hoặc đã mở");
    // }
    if (exam.attemptCount == 0 || exam.attemptCount < MAX_EXAM_OPEN_COUNT) {
      const updatedExam = await prisma.exam.update({
        where: { id: exam.id },
        data: {
          // updatedAt: exam.attemptCount === 0 ? new Date() : undefined,
          attemptCount: {
            increment: 1,
          },
          openAt: exam.attemptCount === 0 ? new Date() : undefined,
          status: "DA_THI",
        },
      });

      if (user) {
        notificationService.notifyOpenExam(
          updatedExam.createdById,
          updatedExam.title,
          user.fullName,
          user.department
        );
      }
      return {
        id: updatedExam.id,
        title: updatedExam.title,
        questionFile: updatedExam.questionFile,
        createdById: updatedExam.createdById,
        attemptCount: updatedExam.attemptCount,
      };
    }
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
          openAt: true,
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
          document: true,
          attemptCount: true,
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
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

  getApproved_Tested: async ({ status, page, query, department }) => {
    const statusFilter = status
      ? { status }
      : {
          status: {
            in: ["DA_DUYET", "DA_THI"],
          },
        };
    const cutoffTime = subMinutes(new Date(), 180);

    const where = {
      ...statusFilter,
      attemptCount: {
        gte: 0,
        lte: 2,
      },
      OR: [
        { openAt: null }, // chưa mở lần nào thì vẫn hiển thị
        { openAt: { gte: cutoffTime } }, // mở rồi nhưng vẫn trong 180 phút
      ],
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
          attemptCount: true,
        },
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
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
    // Validate status
    if (!Object.values(ExamStatus).includes(status)) {
      status = undefined;
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
