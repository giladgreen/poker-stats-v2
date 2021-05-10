import nodemailer from 'nodemailer';
import logger from './logger';

const from = 'info@pokerStats.com';

const { EMAIL_USER } = process.env;
const { EMAIL_PASSWORD } = process.env;

function sendHtmlMail(subject: string, html: string, to: string) {
  if (!EMAIL_USER || !EMAIL_PASSWORD) {
    logger.info('[Email-service] no email user/password, email will not be sent');
    return;
  }
  const mailOptions = {
    from,
    to,
    subject,
    html,
  };
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
  transporter.sendMail(mailOptions, (error: any) => {
    if (error) {
      logger.error(`[Email-service] error sending email: [from: ${mailOptions.from}] [to: ${to}] [subject: ${subject}] - error: ${JSON.stringify(error)}`);
    } else {
      logger.info(`[Email-service] email sent: [from: ${mailOptions.from}] [to: ${to}] [subject: ${subject}]`);
    }
  });
}


export default sendHtmlMail;

