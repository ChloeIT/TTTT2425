const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
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
    return await prisma.exam.create({
      data: {
        title,
        status,
        createdById,
        questionFile,
        answerFile,
      },
    });
  },

  getExamsByUserId: async (userId) => {
    return await prisma.exam.findMany({
      where: { createdById: userId },
      include: { createdBy: true, approval: true },
    });
  },

  getAllExams: async () => {
    return await prisma.exam.findMany({
      include: { createdBy: true, approval: true },
    });
  },

  getExamById: async (id) => {
    return await prisma.exam.findUnique({
      where: { id },
      include: { createdBy: true, approval: true },
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
    notificationService.notifyApproveExam(userId, title);

    return updatedExam;
  },
  rejectExam: async (id, message) => {
    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: "TU_CHOI",
        note: message,
        updatedAt: new Date(),
      },
    });
    const title = updatedExam.title;
    const userId = updatedExam.createdById;

    await prisma.notification.create({
      data: {
        userId,
        message: `Lý do từ chối: ${message}`,
        isRead: false,
        createdAt: new Date(),
        title: `Đề thi ${title} bị từ chối`,
      },
    });

    return updatedExam;
  },

  verifyPassword: async (id, rawPassword) => {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam || !exam.password) return false;

    try {
      const decryptedPassword = decrypt(exam.password);
      return decryptedPassword === rawPassword;
    } catch (error) {
      return false;
    }
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

    // Lưu vào bảng Document
    await prisma.document.create({
      data: {
        questionFile: exam.questionFile,
        answerFile: exam.answerFile,
        retention: "Lưu trữ đề thi đã mở",
        uploadedById: userId,
        createdAt: new Date(),
      },
    });

    // Tạo thông báo mở đề

    notificationService.notifyOpenExam(userId, exam.title);

    return updatedExam;
  },
};

module.exports = examService;
