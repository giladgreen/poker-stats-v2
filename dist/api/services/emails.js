

const __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
};
Object.defineProperty(exports, '__esModule', { value: true });
const nodemailer_1 = __importDefault(require('nodemailer'));
const logger_1 = __importDefault(require('./logger'));

const from = 'info@pokerStats.com';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
function sendHtmlMail(subject, html, to) {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    logger_1.default.info('[Email-service] no email user/password, email will not be sent');
    return;
  }
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };
  const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      logger_1.default.error(`[Email-service] error sending email: [from: ${mailOptions.from}] [to: ${to}] [subject: ${subject}] - error: ${JSON.stringify(error)}`);
    } else {
      logger_1.default.info(`[Email-service] email sent: [from: ${mailOptions.from}] [to: ${to}] [subject: ${subject}]`);
    }
  });
}
exports.default = sendHtmlMail;
// # sourceMappingURL=emails.js.map
