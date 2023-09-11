const { NODEMAILER_EMAIL_HOST } = require("../config");

module.exports.verificationEmail = (firstname, token) => {
  const html = `
      <html lang="en">
        <body>
          <p>Hi ${firstname},</p>
          <p>Click the following link to verify your email:</p>
          <a href="${NODEMAILER_EMAIL_HOST}/verify-user/${token}">Verify Your Email</a>
        </body>
      </html>
    `;
  return html;
};
module.exports.passwordResetEmail = (firstname, token) => {
  const html = `
        <html lang="en">
          <body>
            <p>Hi ${firstname},</p>
            <p>Click the following link to reset your password:</p>
            <a href="${NODEMAILER_EMAIL_HOST}/reset-password/${token}">Reset Password</a>
          </body>
        </html>
      `;
  return html;
};
