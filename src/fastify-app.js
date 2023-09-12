const HandleErrors = require("./utils/error-handler");

module.exports = async (app) => {
  // Register Fastify plugins
  app.register(require("@fastify/cors"), {
    origin: ["http://localhost:5000"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  });

  // Middleware for JSON and URL-encoded form data
  app.register(require("@fastify/formbody"));
  app.register(require("@fastify/multipart"), {
    attachFieldsToBody: true, // This option attaches parsed fields to request.body
  }); // For handling file uploads (Multer equivalent)

  // API routes
  app.register(require("./api/user"), { prefix: "/api" });
  app.register(require("./api/post"), { prefix: "/api" });
  app.register(require("./api/journal"), { prefix: "/api" });

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
