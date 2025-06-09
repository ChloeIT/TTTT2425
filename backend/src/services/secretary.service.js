const prisma = require("../libs/prisma");
const { decrypt } = require("../libs/encrypt");
const notificationService = require("./notification.service");
const userService=require("./user.service");
const secretaryService = {
  getExamsWithDecryptedPasswords: async () => {
    const exams = await prisma.exam.findMany({
      where: {
        status: "DA_DUYET",
        password: {
          not: null,
        },
      },
      include: {
        createdBy: {
          select: {
            fullName: true,
            email: true,
            department: true,
            username: true,
          },
        },
        approval: true,
      },
    });

    const examsWithDecryptedPasswords = exams.map((exam) => {
      const { password, ...rest } = exam; // loại bỏ password mã hóa
      return {
        ...rest,
        decryptedPassword: password ? decrypt(password) : null,
      };
    });

    return examsWithDecryptedPasswords;
  },

  getAllUserEmails: async () => {
    const users = await prisma.user.findMany({
      select: {
        email: true,
      },
    });
    // Trả về mảng email (string hoặc null)
    return users.map((u) => u.email);
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
