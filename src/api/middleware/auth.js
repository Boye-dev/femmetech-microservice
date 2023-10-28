const { ValidateSignature } = require("../../utils");

module.exports = async (req, res, next) => {
  try {
    const isAuthorized = await ValidateSignature(req);

    if (isAuthorized) {
      next(); // Continue to the next middleware or route handler
    } else {
      res.status(403).send({ message: "Not Authorized" });
    }
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
