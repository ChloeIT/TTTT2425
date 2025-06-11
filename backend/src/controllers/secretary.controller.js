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

  getEmailUsers: async (req, res, next) => {
    try {
      const emails = await secretaryService.getAllUserEmails();
      res.status(200).json({ data: emails });
    } catch (error) {
      next(error);
    }
  },

  sendNotification: async (req, res) => {
    try {
      const { email, password ,titleExam } = req.body;

      await secretaryService.notifyUserByEmail(email, password,titleExam);
      return res.status(200).json({ message: `Đã gửi thông báo tới ${email}` });
    } catch (error) {
      console.error("sendNotification error:", error);
      return res.status(500).json({ message: "Lỗi server khi gửi thông báo" });
    }
  },
};

module.exports = secretaryController;
