const express = require("express");
const router = express.Router();
const MessageService = require("../services/message-service");
const ChatService = require("../services/chat-service");
const UserAuth = require("./middleware/auth");
const { upload } = require("../utils");

const service = new MessageService();
const chatService = new ChatService();

// POST ENDPOINT
router.post(
  "/create-message/:chat",
  UserAuth,
  upload.array("files"),
  async (req, res) => {
    try {
      const { chat } = req.params;
      const text = req.body?.text;

      const sender = req.body?.sender;

      let files = req.files;

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

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// GET ENDPOINTS
router.get("/messages/:chat", UserAuth, async (req, res) => {
  try {
    const {
      pageNumber = -1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const { chat } = req.params;

    const { data } = await service.GetMessagesByChatId(
      pageNumber,
      pageSize,
      sortBy,
      sortOrder,
      chat
    );

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

// const MessageService = require("../services/message-service");
// const ChatService = require("../services/chat-service");

// const UserAuth = require("./middleware/auth");

// module.exports = async (fastify) => {
//   const service = new MessageService();
//   const chatService = new ChatService();

//   // POST ENDPOINTS
//   fastify.post(
//     "/create-message/:chat",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { chat } = request.params;
//         const text = request.body?.text?.value;
//         const sender = request.body?.sender?.value;

//         let files = request.body.files;

//         if (!Array.isArray(files) && files) {
//           files = [files];
//         }

//         const { data } = await service.AddMessage({
//           text,
//           chat,
//           files,
//           sender,
//         });
//         const updateData = {
//           lastmessage: text || files[files.length - 1].mimetype,
//         };
//         const lastmessage = await chatService.FindChatByIdAndUpdate({
//           id: chat,
//           updateData,
//         });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   // GET ENDPOINTS
//   fastify.get(
//     "/messages/:chat",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const {
//           pageNumber = -1,
//           pageSize = 10,
//           sortBy = "createdAt",
//           sortOrder = "desc",
//         } = request.query;
//         // If pageNumber is -1, return all
//         const { chat } = request.params;

//         const { data } = await service.GetMessagesByChatId(
//           pageNumber,
//           pageSize,
//           sortBy,
//           sortOrder,
//           chat
//         );
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );
// };
