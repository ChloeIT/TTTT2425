const prisma = require("../libs/prisma");

const checkPrismaHealth = async (req, res, next) => {
  try {
    // Kiểm tra kết nối bằng cách thực hiện một truy vấn đơn giản
    await prisma.$queryRaw`SELECT 1`;

    // Nếu không lỗi, tiếp tục request
    next();
  } catch (error) {
    console.error("Prisma Client is not healthy:", error);
    res.status(500).json({
      error: "Vấn đề kết nối cơ sở dữ liệu",
    });
  }
};
module.exports = checkPrismaHealth;
