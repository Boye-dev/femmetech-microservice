const express = require("express");
const router = express.Router();
const UserService = require("../services/user-service");
const { BadRequestError } = require("../utils/app-errors");
const { upload } = require("../utils");

const service = new UserService();

/* --------------- POST ENDPOINTS --------------- */
// SIGNUP
router.post("/signup", upload.single("files"), async (req, res) => {
  try {
    const firstname = req.body.firstname;
    const phone = req.body.phone;
    const email = req.body.email;
    const lastname = req.body.lastname;
    const role = req.body.role;
    const password = req.body.password;

    let files = req.files;
    if (!Array.isArray(files) && files) {
      files = [files];
    }

    const { data } = await service.SignUp({
      firstname,
      lastname,
      email,
      phone,
      role,
      password,
      files,
    });

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).json(error);
    }
  }
});

// SIGNIN
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data } = await service.SignIn({ email, password });

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).json(error);
    }
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const { data } = await service.ForgotPassword({ email });

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).json(error);
    }
  }
});

// RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const { data } = await service.ResetPassword({ password, token });

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).json(error);
    }
  }
});

/* --------------- PUT ENDPOINTS --------------- */
// EDIT PROFILE
router.put("/edit-profile/:id", upload.array("files"), async (req, res) => {
  try {
    const firstname = req.body.firstname;
    const phone = req.body.phone;
    const lastname = req.body.lastname;
    const { id } = req.params;
    console.log({ fileBoye: req.body });
    let files = req.files;
    if (!Array.isArray(files) && files) {
      files = [files];
    }

    const { data } = await service.EditProfile({
      firstname,
      lastname,
      phone,
      files,
      id,
    });

    console.log({ id, data });
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).json(error);
    }
  }
});

// EDIT PASSWORD
router.put("/edit-password/:id", async (req, res) => {
  try {
    const { newPassword, oldPassword } = req.body;
    const { id } = req.params;

    const { data } = await service.EditPassword({
      newPassword,
      oldPassword,
      id,
    });

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).json(error);
    }
  }
});

// Add Schedule
router.put("/add-schedule/:id", async (req, res) => {
  try {
    const { schedule } = req.body;
    const { id } = req.params;

    const { data } = await service.AddShedule({ id, schedule });

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof BadRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(500).json(error);
    }
  }
});

/* --------------- GET ENDPOINTS --------------- */
// VERIFY USER
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const { data } = await service.VerifyUser({ verificationToken: token });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET ALL USERS
router.get("/users/chat/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await service.GetAllUsers({ id });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET USER BY ID
router.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await service.GetUserById({ id });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET CONSULTANTS
router.get("/consultants", async (req, res) => {
  try {
    const { data } = await service.GetAllConsultants();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

// const UserService = require("../services/user-service");
// const { BadRequestError } = require("../utils/app-errors");

// module.exports = async (fastify) => {
//   const service = new UserService();

//   /* --------------- POST ENDPOINTS ---------------*/
//   //SIGNUP
//   fastify.post("/signup", async (request, reply) => {
//     try {
//       console.log(request.body);
//       const firstname = request.body.firstname.value;
//       const phone = request.body.phone.value;
//       const email = request.body.email.value;
//       const lastname = request.body.lastname.value;
//       const role = request.body.role.value;
//       const password = request.body.password.value;

//       let files = request.body.files;
//       if (!Array.isArray(files) && files) {
//         files = [files];
//       }

//       const { data } = await service.SignUp({
//         firstname,
//         lastname,
//         email,
//         phone,
//         role,
//         password,
//         files,
//       });

//       reply.code(200).send(data);
//     } catch (error) {
//       if (error instanceof BadRequestError) {
//         reply.code(400).send(error.message);
//       } else {
//         reply.code(500).send(error);
//       }
//     }
//   });

//   //SIGNIN
//   fastify.post("/signin", async (request, reply) => {
//     try {
//       const { email, password } = request.body;

//       const { data } = await service.SignIn({ email, password });

//       reply.code(200).send(data);
//     } catch (error) {
//       if (error instanceof BadRequestError) {
//         reply.code(400).send(error.message);
//       } else {
//         reply.code(500).send(error);
//       }
//     }
//   });

//   //FORGOT PASSWORD
//   fastify.post("/forgot-password", async (request, reply) => {
//     try {
//       const { email } = request.body;

//       const { data } = await service.ForgotPassword({ email });

//       reply.code(200).send(data);
//     } catch (error) {
//       if (error instanceof BadRequestError) {
//         reply.code(400).send(error.message);
//       } else {
//         reply.code(500).send(error);
//       }
//     }
//   });

//   //RESET PASSWORD
//   fastify.post("/reset-password/:token", async (request, reply) => {
//     try {
//       const { password } = request.body;
//       const { token } = request.params;

//       const { data } = await service.ResetPassword({ password, token });

//       reply.code(200).send(data);
//     } catch (error) {
//       if (error instanceof BadRequestError) {
//         reply.code(400).send(error.message);
//       } else {
//         reply.code(500).send(error);
//       }
//     }
//   });

//   /* --------------- PUT ENDPOINTS ---------------*/

//   //EDIT PROFILE
//   fastify.put("/edit-profile/:id", async (request, reply) => {
//     try {
//       const firstname = request.body.firstname.value;
//       const phone = request.body.phone.value;
//       const lastname = request.body.lastname.value;
//       const { id } = request.params;

//       let files = request.body.files;
//       if (!Array.isArray(files) && files) {
//         files = [files];
//       }

//       const { data } = await service.EditProfile({
//         firstname,
//         lastname,
//         phone,
//         files,
//         id,
//       });

//       reply.code(200).send(data);
//     } catch (error) {
//       if (error instanceof BadRequestError) {
//         reply.code(400).send(error.message);
//       } else {
//         reply.code(500).send(error);
//       }
//     }
//   });

//   //EDIT PASSWORD
//   fastify.put("/edit-password/:id", async (request, reply) => {
//     try {
//       const { newPassword, oldPassword } = request.body;
//       const { id } = request.params;

//       const { data } = await service.EditPassword({
//         newPassword,
//         oldPassword,
//         id,
//       });

//       reply.code(200).send(data);
//     } catch (error) {
//       if (error instanceof BadRequestError) {
//         reply.code(400).send(error.message);
//       } else {
//         reply.code(500).send(error);
//       }
//     }
//   });

//   //Add Schedule
//   fastify.put("/add-schedule/:id", async (request, reply) => {
//     try {
//       const { schedule } = request.body;
//       const { id } = request.params;

//       const { data } = await service.AddShedule({ id, schedule });

//       reply.code(200).send(data);
//     } catch (error) {
//       if (error instanceof BadRequestError) {
//         reply.code(400).send(error.message);
//       } else {
//         reply.code(500).send(error);
//       }
//     }
//   });

//   /* --------------- GET ENDPOINTS ---------------*/

//   //VERIFY USER
//   fastify.get("/verify/:token", async (request, reply) => {
//     try {
//       const { token } = request.params;

//       const { data } = await service.VerifyUser({ verificationToken: token });

//       reply.code(200).send(data);
//     } catch (error) {
//       reply.code(500).send(error);
//     }
//   });

//   //GET ALL USERS
//   fastify.get("/users/chat/:id", async (request, reply) => {
//     try {
//       const { id } = request.params;

//       const { data } = await service.GetAllUsers({ id });

//       reply.code(200).send(data);
//     } catch (error) {
//       reply.code(500).send(error);
//     }
//   });

//   //GET USER BY ID
//   fastify.get("/users/:id", async (request, reply) => {
//     try {
//       const { id } = request.params;

//       const { data } = await service.GetUserById({ id });

//       reply.code(200).send(data);
//     } catch (error) {
//       reply.code(500).send(error);
//     }
//   });

//   //GET CONSULTANTS
//   fastify.get("/consultants", async (request, reply) => {
//     try {
//       const { data } = await service.GetAllConsultants();

//       reply.code(200).send(data);
//     } catch (error) {
//       reply.code(500).send(error);
//     }
//   });
// };
