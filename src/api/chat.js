const express = require("express");
const router = express.Router();
const ChatService = require("../services/chat-service");
const UserAuth = require("./middleware/auth");

const service = new ChatService();

// POST ENDPOINT
router.post("/create-chat", UserAuth, async (req, res) => {
  try {
    const { members, isGroupChat = false, groupAdmin, groupName } = req.body;

    const { data } = await service.AddChat({
      members,
      isGroupChat,
      groupAdmin,
      groupName,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// PUT ENDPOINT
router.put("/update-chat/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const { data } = await service.FindChatByIdAndUpdate({
      id,
      content,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE JOURNAL
router.delete("/delete-chat/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await service.FindChatByIdAndDelete({ id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET ENDPOINTS
router.get("/chats/:user", UserAuth, async (req, res) => {
  try {
    const {
      pageNumber = -1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    // If pageNumber is -1, return all
    const { user } = req.params;

    const { data } = await service.GetChatsByUserId(
      pageNumber,
      pageSize,
      sortBy,
      sortOrder,
      user
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/groups/:user", UserAuth, async (req, res) => {
  try {
    const {
      pageNumber = -1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    // If pageNumber is -1, return all
    const { user } = req.params;

    const { data } = await service.GetGroupByUserId(
      pageNumber,
      pageSize,
      sortBy,
      sortOrder,
      user
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/chat/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await service.GetChatById({ id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

// const ChatService = require("../services/chat-service");

// const UserAuth = require("./middleware/auth");

// module.exports = async (fastify) => {
//   const service = new ChatService();

//   // POST ENDPOINTS
//   fastify.post(
//     "/create-chat",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const {
//           members,
//           isGroupChat = false,
//           groupAdmin,
//           groupName,
//         } = request.body;

//         const { data } = await service.AddChat({
//           members,
//           isGroupChat,
//           groupAdmin,
//           groupName,
//         });

//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   // PUT ENDPOINTS
//   fastify.put(
//     "/update-chat/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;
//         const { content } = request.body;

//         const { data } = await service.FindChatByIdAndUpdate({
//           id,
//           content,
//         });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   //DELETE JOURNAL
//   fastify.delete(
//     "/delete-chat/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;

//         const { data } = await service.FindChatByIdAndDelete({ id });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   // GET ENDPOINTS
//   fastify.get(
//     "/chats/:user",
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
//         const { user } = request.params;

//         const { data } = await service.GetChatsByUserId(
//           pageNumber,
//           pageSize,
//           sortBy,
//           sortOrder,
//           user
//         );
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );
//   fastify.get(
//     "/groups/:user",
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
//         const { user } = request.params;

//         const { data } = await service.GetGroupByUserId(
//           pageNumber,
//           pageSize,
//           sortBy,
//           sortOrder,
//           user
//         );
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );
//   fastify.get(
//     "/chat/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;

//         const { data } = await service.GetChatById({ id });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );
// };
