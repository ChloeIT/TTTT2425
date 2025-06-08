const prisma = require("../libs/prisma");
const { decrypt } = require("../libs/encrypt");

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
        createdBy: true,
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
};

module.exports = secretaryService;
