const nodemailer = require('nodemailer');
const logger = require('./logger');

const from = 'info@pokerStats.com';
const { emailUser } = process.env;
const { emailPassword } = process.env;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

function sendHtmlMail(subject, html, to) {
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      logger.error(`[Email-service] error sending email: [from: ${mailOptions.from}] [to: ${to}] [subject: ${subject}] - error: ${JSON.stringify(error)}`);
    } else {
      logger.info(`[Email-service] email sent: [from: ${mailOptions.from}] [to: ${to}] [subject: ${subject}]`);
    }
  });
}


module.exports = {
  sendHtmlMail,
};
