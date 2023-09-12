const JournalService = require("../services/journal-service");

const UserAuth = require("./middleware/auth");

module.exports = async (fastify) => {
  const service = new JournalService();

  // POST ENDPOINTS
  fastify.post(
    "/create-journal",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const { user, content } = request.body;

        const { data } = await service.AddJournal({ user, content });
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );

  // PUT ENDPOINTS
  fastify.put(
    "/update-journal/:id",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { content } = request.body;

        const { data } = await service.FindJournalByIdAndUpdate({
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
    "/delete-journal/:id",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const { data } = await service.FindJournalByIdAndDelete({ id });
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );

  // GET ENDPOINTS
  fastify.get(
    "/journals/:user",
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

        const { data } = await service.GetJournalsByUserId(
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
    "/journal/:id",
    { preHandler: [UserAuth] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        const { data } = await service.GetJournalById({ id });
        reply.code(200).send(data);
      } catch (error) {
        reply.code(500).send(error);
      }
    }
  );
};
