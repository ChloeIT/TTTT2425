const secretaryService = require("../services/secretary.service");

const secretaryController = {
  getExamsForSecretary: async (req, res, next) => {
    try {
      const exams = await secretaryService.getExamsWithDecryptedPasswords();
      res.status(200).json({ data: exams });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = secretaryController;
