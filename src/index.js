const fastify = require("fastify")({ logger: true });
const { databaseConnection } = require("./database");
const { PORT } = require("./config");
const fastifyApp = require("./fastify-app");

const StartServer = async () => {
  await databaseConnection();

  await fastifyApp(fastify);

  try {
    await fastify.listen(PORT);
    fastify.log.info(`Server is listening on port ${PORT}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

StartServer();
