const { socket } = require("./socket");
const express = require("express");
const HandleErrors = require("./utils/error-handler");

module.exports = async (app) => {
  // Create an Express app

  // Enable CORS
  const corsOptions = {
    origin: ["http://localhost:5000", "https://femmetech.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  };
  app.use(require("cors")(corsOptions));

  // Middleware for JSON and URL-encoded form data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // For handling file uploads (Multer equivalent)

  // Initialize Socket.io

  // API routes
  app.use("/api", require("./api/user"));
  app.use("/api", require("./api/post"));
  app.use("/api", require("./api/journal"));
  app.use("/api", require("./api/chat"));
  app.use("/api", require("./api/message"));
  app.use("/api", require("./api/appointment"));

  // Error handling middleware
  app.use((error, request, response, next) => {
    const statusCode = error.statusCode || 500;
    response.status(statusCode).json({
      statusCode,
      error: error.name || "Internal Server Error",
      message: error.message || "An error occurred.",
    });
  });
};
