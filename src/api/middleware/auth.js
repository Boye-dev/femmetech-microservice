const { ValidateSignature } = require("../../utils");

module.exports = async (request, reply) => {
  try {
    const isAuthorized = await ValidateSignature(request);

    if (isAuthorized) {
      return;
    }
    reply.status(403).send({ message: "Not Authorized" });
  } catch (error) {
    console.error("Authorization error:", error);
    reply.status(500).send({ message: "Internal Server Error" });
  }
};
