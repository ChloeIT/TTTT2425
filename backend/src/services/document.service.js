const prisma = require("../libs/prisma");
const moment = require("moment");
const { encrypt, decrypt } = require("../libs/encrypt");

const LIMIT = 10;

const getDocumentById = async (id) => {
  return await prisma.document.findUnique({
    where: { id },
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
      orderBy: [{ document: { createdAt: "desc" } }],
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
    prisma.exam.count({ where }),
  ]);

  const totalPage = Math.ceil(count / LIMIT);

  return { data, totalPage };
};

const verifyPassword = async (documentId, inputPassword) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      exam: {
        select: {
          password: true,
        },
      },
    },
  });

  if (!document || !document.exam) return false;

  const decryptedPassword = decrypt(document.exam.password);
  return decryptedPassword === inputPassword;
};

module.exports = {
  getDocumentById,
  getDocuments,
  getExamsByStatusWithDocuments,
  verifyPassword,
  // ✅ export ở đây
};
