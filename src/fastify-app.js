const { socket } = require("./socket");
const HandleErrors = require("./utils/error-handler");
const WebSocket = require("websocket").server;
module.exports = async (app) => {
  // Register Fastify plugins
  app.register(require("@fastify/cors"), {
    origin: ["http://localhost:5000", "https://femmetech.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  });

  // Middleware for JSON and URL-encoded form data
  app.register(require("@fastify/formbody"));
  app.register(require("@fastify/multipart"), {
    attachFieldsToBody: true, // This option attaches parsed fields to request.body
  }); // For handling file uploads (Multer equivalent)
  app.register(require("fastify-socket.io"), {
    cors: {
      origin: ["http://localhost:5000", "https://femmetech.vercel.app"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  // Initialize Socket.io
  socket(app);

  // API routes
  app.register(require("./api/user"), { prefix: "/api" });
  app.register(require("./api/post"), { prefix: "/api" });
  app.register(require("./api/journal"), { prefix: "/api" });
  app.register(require("./api/chat"), { prefix: "/api" });
  app.register(require("./api/message"), { prefix: "/api" });
  app.register(require("./api/appointment"), { prefix: "/api" });

  //error handling
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode || 500;
    reply.code(statusCode).send({
      statusCode,
      error: error.name || "Internal Server Error",
      message: error.message || "An error occurred.",
    });
  });
};
