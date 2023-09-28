const UserService = require("../services/user-service");
const { BadRequestError } = require("../utils/app-errors");

module.exports = async (fastify) => {
  const service = new UserService();

  /* --------------- POST ENDPOINTS ---------------*/
  //SIGNUP
  fastify.post("/signup", async (request, reply) => {
    try {
      console.log(request.body);
      const firstname = request.body.firstname.value;
      const phone = request.body.phone.value;
      const email = request.body.email.value;
      const lastname = request.body.lastname.value;
      const role = request.body.role.value;
      const password = request.body.password.value;

      let files = request.body.files;
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

      reply.code(200).send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        reply.code(400).send(error.message);
      } else {
        reply.code(500).send(error);
      }
    }
  });

  //SIGNIN
  fastify.post("/signin", async (request, reply) => {
    try {
      const { email, password } = request.body;

      const { data } = await service.SignIn({ email, password });

      reply.code(200).send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        reply.code(400).send(error.message);
      } else {
        reply.code(500).send(error);
      }
    }
  });

  //FORGOT PASSWORD
  fastify.post("/forgot-password", async (request, reply) => {
    try {
      const { email } = request.body;

      const { data } = await service.ForgotPassword({ email });

      reply.code(200).send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        reply.code(400).send(error.message);
      } else {
        reply.code(500).send(error);
      }
    }
  });

  //RESET PASSWORD
  fastify.post("/reset-password/:token", async (request, reply) => {
    try {
      const { password } = request.body;
      const { token } = request.params;

      const { data } = await service.ResetPassword({ password, token });

      reply.code(200).send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        reply.code(400).send(error.message);
      } else {
        reply.code(500).send(error);
      }
    }
  });

  /* --------------- PUT ENDPOINTS ---------------*/

  //EDIT PROFILE
  fastify.put("/edit-profile/:id", async (request, reply) => {
    try {
      const firstname = request.body.firstname.value;
      const phone = request.body.phone.value;
      const lastname = request.body.lastname.value;
      const { id } = request.params;

      let files = request.body.files;
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

      reply.code(200).send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        reply.code(400).send(error.message);
      } else {
        reply.code(500).send(error);
      }
    }
  });

  //EDIT PASSWORD
  fastify.put("/edit-password/:id", async (request, reply) => {
    try {
      const { newPassword, oldPassword } = request.body;
      const { id } = request.params;

      const { data } = await service.EditPassword({
        newPassword,
        oldPassword,
        id,
      });

      reply.code(200).send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        reply.code(400).send(error.message);
      } else {
        reply.code(500).send(error);
      }
    }
  });

  //Add Schedule
  fastify.put("/add-schedule/:id", async (request, reply) => {
    try {
      const { schedule } = request.body;
      const { id } = request.params;

      const { data } = await service.AddShedule({ id, schedule });

      reply.code(200).send(data);
    } catch (error) {
      if (error instanceof BadRequestError) {
        reply.code(400).send(error.message);
      } else {
        reply.code(500).send(error);
      }
    }
  });

  /* --------------- GET ENDPOINTS ---------------*/

  //VERIFY USER
  fastify.get("/verify/:token", async (request, reply) => {
    try {
      const { token } = request.params;

      const { data } = await service.VerifyUser({ verificationToken: token });

      reply.code(200).send(data);
    } catch (error) {
      reply.code(500).send(error);
    }
  });

  //GET ALL USERS
  fastify.get("/users/chat/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      const { data } = await service.GetAllUsers({ id });

      reply.code(200).send(data);
    } catch (error) {
      reply.code(500).send(error);
    }
  });

  //GET USER BY ID
  fastify.get("/users/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      const { data } = await service.GetUserById({ id });

      reply.code(200).send(data);
    } catch (error) {
      reply.code(500).send(error);
    }
  });

  //GET CONSULTANTS
  fastify.get("/consultants", async (request, reply) => {
    try {
      const { data } = await service.GetAllConsultants();

      reply.code(200).send(data);
    } catch (error) {
      reply.code(500).send(error);
    }
  });
};
