
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
const LIMIT = 10;
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
 const getExamsByStatusWithDocuments = async ({
    page = 1,
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
     document:{
            is: {},
          },
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
         document : true,
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
    };

module.exports = {
  getDocumentById,
  getDocuments,
  getExamsByStatusWithDocuments,
  // các hàm khác
};
