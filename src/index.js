const fastify = require("fastify")({ logger: true });
const { databaseConnection } = require("./database");
const { PORT } = require("./config");
const fastifyApp = require("./fastify-app");
const { socket } = require("./socket");

const StartServer = async () => {
  try {
    // Connect to the database
    await databaseConnection();

    // Initialize Fastify app
    await fastifyApp(fastify);

    // Start the HTTP server
    await fastify.listen({ port: PORT, host: "0.0.0.0" });

    fastify.log.info(`Server is listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    console.error("Error starting the server:", err);
    process.exit(1);
  }
};

StartServer();
