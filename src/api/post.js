const express = require("express");
const router = express.Router();
const PostService = require("../services/post-service");
const UserAuth = require("./middleware/auth");
const { upload } = require("../utils");

const service = new PostService();

// POST ENDPOINTS
router.post(
  "/create-post",
  UserAuth,
  upload.array("files"),
  async (req, res) => {
    try {
      const text = req.body.text;
      const user = req.body.user;
      let files = req.files;

      if (!Array.isArray(files) && files) {
        files = [files];
      }
      const { data } = await service.AddPost({ text, user, files });
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

// PUT ENDPOINTS
router.put("/like-post/:id", UserAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    const { id } = req.params;
    const { data } = await service.LikePost({ id, userId });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// ADD COMMENT
router.put("/add-comment/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { user, text } = req.body;
    const { data } = await service.AddComment({ text, user, id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET ENDPOINTS
router.get("/posts", UserAuth, async (req, res) => {
  try {
    const {
      pageNumber = -1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const { data } = await service.GetPosts(
      pageNumber,
      pageSize,
      sortBy,
      sortOrder
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/post/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await service.GetPostById({ id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/", (req, res) => {
  try {
    res.status(200).json({ message: "Authenticated" });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

// const PostService = require("../services/post-service");

// const UserAuth = require("./middleware/auth");

// module.exports = async (fastify) => {
//   const service = new PostService();

//   // POST ENDPOINTS
//   fastify.post(
//     "/create-post",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         console.log(request.body);
//         const text = request.body.text.value;
//         const user = request.body.user.value;
//         let files = request.body.files;

//         if (!Array.isArray(files) && files) {
//           files = [files];
//         }
//         const { data } = await service.AddPost({ text, user, files });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   // PUT ENDPOINTS
//   fastify.put(
//     "/like-post/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { userId } = request.body;

//         const { id } = request.params;
//         const { data } = await service.LikePost({ id, userId });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   //ADD COMMENT
//   fastify.put(
//     "/add-comment/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;
//         const { user, text } = request.body;
//         const { data } = await service.AddComment({ text, user, id });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   // GET ENDPOINTS
//   fastify.get("/posts", { preHandler: [UserAuth] }, async (request, reply) => {
//     try {
//       const {
//         pageNumber = -1,
//         pageSize = 10,
//         sortBy = "createdAt",
//         sortOrder = "desc",
//       } = request.query;
//       // If pageNumber is -1, return all

//       const { data } = await service.GetPosts(
//         pageNumber,
//         pageSize,
//         sortBy,
//         sortOrder
//       );
//       reply.code(200).send(data);
//     } catch (error) {
//       reply.code(500).send(error);
//     }
//   });
//   fastify.get(
//     "/post/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;

//         const { data } = await service.GetPostById({ id });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );
//   fastify.get("/", async (request, reply) => {
//     try {
//       reply.code(200).send({ message: "Authenticated" });
//     } catch (error) {
//       reply.code(500).send(error);
//     }
//   });
// };
