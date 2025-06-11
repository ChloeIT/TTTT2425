
const prisma = require("../libs/prisma");

const getDocumentById = async (id) => {
  return await prisma.document.findUnique({
    where: { id },
  });
};

module.exports = {
  getDocumentById,
  // các hàm khác
};
