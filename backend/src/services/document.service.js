
const prisma = require("../libs/prisma");

const getDocumentById = async (id) => {
  return await prisma.document.findUnique({
    where: { id: id, },
    include: {
      exam: {
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
      },
    },
  });
};  
const getDocuments = async () => {
  return await prisma.document.findMany({
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          createdAt: true,
          createdById: true,
          createdBy: {
            select: {
              fullName: true,
              department: true,
            },
          },
        },
      },
    },
  });
};

module.exports = {
  getDocumentById,
  getDocuments,
  // các hàm khác
};
