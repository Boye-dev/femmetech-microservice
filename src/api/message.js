const MessageService = require("../services/message-service");
const ChatService = require("../services/chat-service");

const UserAuth = require("./middleware/auth");

module.exports = async (fastify) => {
  const service = new MessageService();
  const chatService = new ChatService();

  // POST ENDPOINTS
  fastify.post(
    "/create-message/:chat",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const { chat } = request.params;
        const text = request.body?.text?.value;
        const sender = request.body?.sender?.value;

        let files = request.body.files;

        if (!Array.isArray(files) && files) {
          files = [files];
        }

        const { data } = await service.AddMessage({
          text,
          chat,
          files,
          sender,
        });
        const updateData = {
          lastmessage: text || files[files.length - 1].mimetype,
        };
        const lastmessage = await chatService.FindChatByIdAndUpdate({
          id: chat,
          updateData,
        });
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );

  // GET ENDPOINTS
  fastify.get(
    "/messages/:chat",
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
        const { chat } = request.params;

        const { data } = await service.GetMessagesByChatId(
          pageNumber,
          pageSize,
          sortBy,
          sortOrder,
          chat
        );
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );
};
