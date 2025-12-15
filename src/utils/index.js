const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const axios = require("axios");
const {
  APP_SECRET,
  NODEMAILER_EMAIL,
  NODEMAILER_PASSWORD,
} = require("../config");
const amqplib = require("amqplib");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

//Utility functions
const multer = require("multer");

module.exports.upload = multer();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryImageUpload = (imageBuffer, folder, resource_type) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "FemmeTech",
        resource_type: resource_type || "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(imageBuffer);
    bufferStream.push(null);

    bufferStream.pipe(uploadStream);
  });
};

module.exports.UploadMultipleToS3 = async (files) => {
  try {
    if (!files || files.length === 0) {
      console.log("No files were provided for upload.");
      return [];
    }

    const filePromises = files.map(async (file) => {
      const result = await cloudinaryImageUpload(file.buffer);
      return result.secure_url;
    });
    const fileKeys = await Promise.all(filePromises);

    return fileKeys;
  } catch (error) {
    throw error;
  }
};
module.exports.UploadMultipleToS3WithFileType = async (files) => {
  try {
    if (!files || files.length === 0) {
      console.log("No files were provided for upload.");
      return [];
    }

    const filePromises = files.map(async (file) => {
      const result = await cloudinaryImageUpload(file.buffer);
      return { url: result.secure_url, filetype: file.mimetype };
    });
    const fileKeys = await Promise.all(filePromises);

    return fileKeys;
  } catch (error) {
    throw error;
  }
};

module.exports.UploadSingleToS3 = async (files) => {
  console.log(files);
  try {
    if (!files || files.length === 0) {
      console.log("No files were provided for upload.");
      return false;
    }
    const file = files[0];

    const result = await cloudinaryImageUpload(file.buffer);
    return result.secure_url;
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
