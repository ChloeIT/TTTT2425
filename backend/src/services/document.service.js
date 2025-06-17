const prisma = require("../libs/prisma");
const moment = require("moment");

const getDocumentById = async (id) => {
  return await prisma.document.findUnique({
    where: { id: id },
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
  const tenDaysAgo = moment().subtract(10, "days").startOf("day").toDate();
  const where = {
    ...(query && {
      title: {
        contains: query,
      },
    }),

    document: { createdAt: { gte: tenDaysAgo } },
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
      orderBy: [
        {
          document: {
            createdAt: "desc",
          },
        },
      ],

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
        document: true,
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
