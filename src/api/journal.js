const express = require("express");
const router = express.Router();
const JournalService = require("../services/journal-service");
const UserAuth = require("./middleware/auth");

const service = new JournalService();

// POST ENDPOINT
router.post("/create-journal", UserAuth, async (req, res) => {
  try {
    const { user, content } = req.body;

    const { data } = await service.AddJournal({ user, content });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// PUT ENDPOINT
router.put("/update-journal/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const { data } = await service.FindJournalByIdAndUpdate({
      id,
      content,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE JOURNAL
router.delete("/delete-journal/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await service.FindJournalByIdAndDelete({ id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET ENDPOINTS
router.get("/journals/:user", UserAuth, async (req, res) => {
  try {
    const {
      pageNumber = -1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    // If pageNumber is -1, return all
    const { user } = req.params;

    const { data } = await service.GetJournalsByUserId(
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

router.get("/journal/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await service.GetJournalById({ id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

// const JournalService = require("../services/journal-service");

// const UserAuth = require("./middleware/auth");

// module.exports = async (fastify) => {
//   const service = new JournalService();

//   // POST ENDPOINTS
//   fastify.post(
//     "/create-journal",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { user, content } = request.body;

//         const { data } = await service.AddJournal({ user, content });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   // PUT ENDPOINTS
//   fastify.put(
//     "/update-journal/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;
//         const { content } = request.body;

//         const { data } = await service.FindJournalByIdAndUpdate({
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
//     "/delete-journal/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;

//         const { data } = await service.FindJournalByIdAndDelete({ id });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   // GET ENDPOINTS
//   fastify.get(
//     "/journals/:user",
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

//         const { data } = await service.GetJournalsByUserId(
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
//     "/journal/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;

//         const { data } = await service.GetJournalById({ id });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );
// };
