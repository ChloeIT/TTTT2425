const prisma = require("../libs/prisma");
const { encrypt, decrypt } = require("../libs/encrypt");
const notificationService = require("./notification.service");

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

  getExamsByUserId: async (userId) => {
    return await prisma.exam.findMany({
      where: { createdById: userId },
      include: { createdBy: true },
    });
  },

  etAllExams: async () => {
    return await prisma.exam.findMany({
      include: {
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
  // getAllExams: async () => {
  //   return await prisma.exam.findMany({
  //     include: {
  //       createdBy: {
  //         select: {
  //           id: true,
  //           fullName: true,
  //           email: true,
  //           department: true,
  //
  //         },
  //       },
  //       approval: true,
  //     },
  //   });
  // },

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
    const encryptedPassword = encrypt(rawPassword);

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: "DA_DUYET",
        password: encryptedPassword,
        updatedAt: new Date(),
      },
    });

    const title = updatedExam.title;

    // Tạo thông báo notification
    notificationService.notifyApproveExam(updatedExam.createdById, title);

    return updatedExam;
  },
  rejectExam: async (id, message, userId) => {
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: "TU_CHOI",
        note: message,
        updatedAt: new Date(),
      },
    });
    // const title = updatedExam.title;
    // const userId = updatedExam.createdById;

    // await prisma.notification.create({
    //   data: {
    //     userId,
    //     message: `Lý do từ chối: ${message}`,
    //     isRead: false,
    //     createdAt: new Date(),
    //     title: `Đề thi ${title} bị từ chối`,
    //   },
    // });

    // Gửi thông báo và email bằng notificationService
    await notificationService.notifyRejectExam(
      updatedExam.createdById,
      updatedExam.title,
      message
    );

    return updatedExam;
  },

  verifyPassword: async (examId, inputPassword) => {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });
    if (!exam) return false;

    const decryptedPassword = decrypt(exam.password);
    return decryptedPassword === inputPassword;
  },

  openExam: async (id, userId) => {
    // Kiểm tra trạng thái phải là DA_DUYET
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam || exam.status !== "DA_DUYET") {
      throw new Error("Exam not approved or already opened");
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
};

module.exports = examService;