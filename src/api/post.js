const PostService = require("../services/post-service");

const UserAuth = require("./middleware/auth");

module.exports = async (fastify) => {
  const service = new PostService();

  // POST ENDPOINTS
  fastify.post("/create-post", async (request, reply) => {
    try {
      const text = request.body.text.value;
      const userId = request.body.userId.value;
      let files = request.body.files;

      if (!Array.isArray(files)) {
        files = [files];
      }
      const { data } = await service.AddPost({ text, userId, files });
      reply.code(200).send(data);
    } catch (error) {
      reply.code(500).send(error);
    }
  });

  // PUT ENDPOINTS
  fastify.put("/like-post/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { data } = await service.LikePost({ id });
      reply.code(200).send(data);
    } catch (error) {
      reply.code(500).send(error);
    }
  });

  //ADD COMMENT
  fastify.put("/add-comment/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const { userId, text } = request.body;
      const { data } = await service.AddComment({ text, userId, id });
      reply.code(200).send(data);
    } catch (error) {
      reply.code(500).send(error);
    }
  });

  // GET ENDPOINTS
  fastify.get("/posts", async (request, reply) => {
    try {
      const {
        pageNumber = -1,
        pageSize = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = request.query;
      // If pageNumber is -1, return all

      const { data } = await service.GetPosts(pageNumber, pageSize);
      reply.code(200).send(data);
    } catch (error) {
      reply.code(500).send(error);
    }
  });
  fastify.get("/", async (request, reply) => {
    try {
      reply.code(200).send({ message: "Authenticated" });
    } catch (error) {
      reply.code(500).send(error);
    }
  });
};