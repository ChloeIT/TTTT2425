const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");

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

  getAllExams: async () => {
    return await prisma.exam.findMany({
      include: { createdBy: true, approval: true, notifications: true },
    });
  },

  getExamById: async (id) => {
    return await prisma.exam.findUnique({
      where: { id },
      include: { createdBy: true, approval: true, notifications: true },
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
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const updatedExam = await prisma.exam.update({
      where: { id },
      data: {
        status: "DA_DUYET",
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    const title = updatedExam.title;

    // Tạo thông báo notification
    await prisma.notification.create({
      data: {
        userId,
        examId: id,
        message: `Đề thi "${title}" đã được duyệt.`,
        isRead: false,
        createdAt: new Date(),
        
      },
    });

    return updatedExam;
  },

  verifyPassword: async (id, rawPassword) => {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam || !exam.password) return false;
    return await bcrypt.compare(rawPassword, exam.password);
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
    await prisma.notification.create({
      data: {
        userId,
        examId: id,
        message: `Đề thi "${exam.title}" đã được mở.`,
        isRead: false,
        createdAt: new Date(),
      },
    });

    return updatedExam;
  },
};

module.exports = examService;
