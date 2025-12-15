const dotEnv = require("dotenv");

// if (process.env.NODE_ENV !== "prod") {
//   const configFile = `./.env.${process.env.NODE_ENV}`;
//   dotEnv.config({ path: configFile });
// } else {
// }
dotEnv.config();

module.exports = {
  PORT: process.env.PORT,
  DB_URL: process.env.MONGODB_URI,
  APP_SECRET: process.env.APP_SECRET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  S3_REGION: process.env.S3_REGION,
  S3_BUCKET: process.env.S3_BUCKET,
  NODEMAILER_EMAIL: process.env.NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD: process.env.NODEMAILER_PASSWORD,
  CLOUDFRONTURL: process.env.CLOUDFRONTURL,
  NODEMAILER_EMAIL_HOST: process.env.NODEMAILER_EMAIL_HOST,
};
