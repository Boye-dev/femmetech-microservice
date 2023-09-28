const ChatService = require("../services/chat-service");

const UserAuth = require("./middleware/auth");

module.exports = async (fastify) => {
  const service = new ChatService();

  // POST ENDPOINTS
  fastify.post(
    "/create-chat",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const {
          members,
          isGroupChat = false,
          groupAdmin,
          groupName,
        } = request.body;

        const { data } = await service.AddChat({
          members,
          isGroupChat,
          groupAdmin,
          groupName,
        });

        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );

  // PUT ENDPOINTS
  fastify.put(
    "/update-chat/:id",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { content } = request.body;

        const { data } = await service.FindChatByIdAndUpdate({
          id,
          content,
        });
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );

  //DELETE JOURNAL
  fastify.delete(
    "/delete-chat/:id",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const { data } = await service.FindChatByIdAndDelete({ id });
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );

  // GET ENDPOINTS
  fastify.get(
    "/chats/:user",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const {
          pageNumber = -1,
          pageSize = 10,
          sortBy = "createdAt",
          sortOrder = "desc",
        } = request.query;
        // If pageNumber is -1, return all
        const { user } = request.params;

        const { data } = await service.GetChatsByUserId(
          pageNumber,
          pageSize,
          sortBy,
          sortOrder,
          user
        );
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );
  fastify.get(
    "/groups/:user",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const {
          pageNumber = -1,
          pageSize = 10,
          sortBy = "createdAt",
          sortOrder = "desc",
        } = request.query;
        // If pageNumber is -1, return all
        const { user } = request.params;

        const { data } = await service.GetGroupByUserId(
          pageNumber,
          pageSize,
          sortBy,
          sortOrder,
          user
        );
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );
  fastify.get(
    "/chat/:id",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const { data } = await service.GetChatById({ id });
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );
};
