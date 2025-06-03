const nodemailer = require("nodemailer");

const mail = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: process.env.GOOGLE_APP_ACCOUNT,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

module.exports = mail;
