const nodemailer = require("nodemailer");
const emailConfig = require("../config/email.config");

const transporter = nodemailer.createTransport({
  host: emailConfig.HOST,
  port: emailConfig.PORT,
  secure: true,
  auth: {
    user: emailConfig.USERNAME,
    pass: emailConfig.PASSWORD,
  },
});

transporter.verify((error, _success) => {
  if (error) console.log(error);
  else console.log("Email server is up and running!");
});

module.exports.send = async options => {
  const mailOptions = {
    from: "Travel Booking",
    to: options.to,
    subject: options.subject,
  };

  if (options.isNewsletter) {
    if (options.attachments) mailOptions.attachments = options.attachments;
  }

  if (options.html) mailOptions.html = options.html;
  if (options.message) mailOptions.text = options.message;

  const email = await transporter.sendMail(mailOptions);

  return email;
};
