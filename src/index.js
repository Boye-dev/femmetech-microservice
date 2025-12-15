const fastify = require("fastify")({ logger: true });
const express = require("express");
const { databaseConnection } = require("./database");
const { PORT } = require("./config");
const fastifyApp = require("./fastify-app");
const expressApp = require("./express-app");
const { socket } = require("./socket");
const { Server } = require("socket.io");
const http = require("http");

const StartServer = async () => {
  try {
    const app = express();
    // Connect to the database
    await databaseConnection();

    // Initialize Fastify app
    // await fastifyApp(fastify);

    await expressApp(app);

    // Start the HTTP server
    // await fastify.listen({ port: PORT, host: "0.0.0.0" });

    const server = http.createServer(app);
    // Only start server after connection to database has been established
    const io = new Server(server, {
      cors: {
        origin: [
          "https://femmetech.boye-dev.com",
          "http://localhost:5000",
          "https://femmetech.vercel.app",
          "http://localhost:3000",
        ],
      },
    });

    socket(io);
    server.listen(PORT, () => {
      console.log(`Server listening on PORT ${PORT}`);
    });

    // fastify.log.info(`Server is listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    console.error("Error starting the server:", err);
    process.exit(1);
  }
};

StartServer();
