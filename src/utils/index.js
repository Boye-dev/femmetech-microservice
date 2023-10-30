const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const axios = require("axios");
const {
  APP_SECRET,
  NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_REGION,
  CLOUDFRONTURL,
} = require("../config");
const amqplib = require("amqplib");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

//Utility functions
const multer = require("multer");

module.exports.upload = multer();

module.exports.UploadMultipleToS3 = async (files) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: S3_REGION,
  });

  const bucketName = S3_BUCKET;

  try {
    if (!files || files.length === 0) {
      console.log("No files were provided for upload.");
      return [];
    }

    const filePromises = files.map(async (file) => {
      const key = `${uuidv4()}-${file.originalname}`;
      console.log(file.mimetype);
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const command = new PutObjectCommand(params);

      return s3
        .send(command)
        .then(() => {
          const url = CLOUDFRONTURL + key;
          return url;
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          throw error;
        });
    });
    const fileKeys = await Promise.all(filePromises);

    return fileKeys;
  } catch (error) {
    throw error;
  }
};
module.exports.UploadMultipleToS3WithFileType = async (files) => {
  const s3 = new S3Client({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: S3_REGION,
  });

  const bucketName = S3_BUCKET;

  try {
    if (!files || files.length === 0) {
      console.log("No files were provided for upload.");
      return [];
    }

    const filePromises = files.map(async (file) => {
      const key = `${uuidv4()}-${file.originalname}`;
      console.log(file.mimetype);
      const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const command = new PutObjectCommand(params);

      return s3
        .send(command)
        .then(() => {
          const url = CLOUDFRONTURL + key;
          return { url, filetype: file.mimetype };
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          throw error;
        });
    });
    const fileKeys = await Promise.all(filePromises);

    return fileKeys;
  } catch (error) {
    throw error;
  }
};

module.exports.UploadSingleToS3 = async (files) => {
  console.log(files);
  const s3 = new S3Client({
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
    region: S3_REGION,
  });

  const bucketName = S3_BUCKET;

  try {
    if (!files || files.length === 0) {
      console.log("No files were provided for upload.");
      return false;
    }
    const file = files[0];

    const key = `${uuidv4()}-${file.originalname}`;
    console.log(file.mimetype);
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    const command = new PutObjectCommand(params);

    return s3
      .send(command)
      .then(() => {
        const url = CLOUDFRONTURL + key;
        return url;
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
        throw error;
      });
  } catch (error) {
    throw error;
  }
};

module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports.ValidateSignature = async (req) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authorizationHeader.split(" ")[1];
    const payload = jwt.verify(token, APP_SECRET);

    req.user = payload;

    return true;
  } catch (error) {
    console.error("Authorization error:", error);
    return false;
  }
};
module.exports.SendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: NODEMAILER_EMAIL,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    return false;
  }
};

module.exports.GenerateVerificationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return token;
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};
