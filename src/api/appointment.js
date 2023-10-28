const express = require("express");
const router = express.Router();
const AppointmentService = require("../services/appointment-service");
const UserAuth = require("./middleware/auth");

const service = new AppointmentService();

// POST ENDPOINT
router.post("/create-appointment", UserAuth, async (req, res) => {
  try {
    const { patient, consultant, description, date, startTime, endTime } =
      req.body;

    const { data } = await service.AddAppointment({
      patient,
      consultant,
      description,
      date,
      startTime,
      endTime,
    });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// PUT ENDPOINT
router.put("/update-appointment/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { consultant, date, endTime, startTime, status } = req.body;

    if (status) {
      const { data } = await service.FindAppointmentByIdAndUpdateStatus({
        id,
        updateData: {
          status,
        },
      });
      res.status(200).json(data);
    } else {
      const { data } = await service.FindAppointmentByIdAndUpdate({
        id,
        updateData: {
          consultant,
          date,
          endTime,
          startTime,
        },
      });
      res.status(200).json(data);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET ENDPOINTS
router.get("/appointments/:user", UserAuth, async (req, res) => {
  try {
    const {
      pageNumber = -1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status = "SCHEDULED",
      filter,
    } = req.query;

    const { user } = req.params;

    const { data } = await service.GetAppointmentsByUserId(
      pageNumber,
      pageSize,
      sortBy,
      sortOrder,
      status,
      filter,
      user
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET single appointment by ID
router.get("/appointment/:id", UserAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const { data } = await service.GetAppointmentById({ id });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;

// const AppointmentService = require("../services/appointment-service");

// const UserAuth = require("./middleware/auth");

// module.exports = async (fastify) => {
//   const service = new AppointmentService();

//   // POST ENDPOINTS
//   fastify.post(
//     "/create-appointment",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { patient, consultant, description, date, startTime, endTime } =
//           request.body;

//         const { data } = await service.AddAppointment({
//           patient,
//           consultant,
//           description,
//           date,
//           startTime,
//           endTime,
//         });

//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   // PUT ENDPOINTS
//   fastify.put(
//     "/update-appointment/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;
//         const { consultant, date, endTime, startTime, status } = request.body;

//         if (status) {
//           const { data } = await service.FindAppointmentByIdAndUpdateStatus({
//             id,
//             updateData: {
//               status,
//             },
//           });
//           reply.code(200).send(data);
//         } else {
//           const { data } = await service.FindAppointmentByIdAndUpdate({
//             id,
//             updateData: {
//               consultant,
//               date,
//               endTime,
//               startTime,
//             },
//           });
//           reply.code(200).send(data);
//         }
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );

//   //   //DELETE JOURNAL
//   //   fastify.delete(
//   //     "/delete-appointment/:id",
//   //     { preHandler: [UserAuth] },
//   //     async (request, reply) => {
//   //       try {
//   //         const { id } = request.params;

//   //         const { data } = await service.FindAppointmentByIdAndDelete({ id });
//   //         reply.code(200).send(data);
//   //       } catch (error) {
//   //         reply.code(500).send(error);
//   //       }
//   //     }
//   //   );

//   // GET ENDPOINTS
//   fastify.get(
//     "/appointments/:user",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const {
//           pageNumber = -1,
//           pageSize = 10,
//           sortBy = "createdAt",
//           sortOrder = "desc",
//           status = "SCHEDULED",
//           filter,
//         } = request.query;
//         // If pageNumber is -1, return all
//         const { user } = request.params;

//         const { data } = await service.GetAppointmentsByUserId(
//           pageNumber,
//           pageSize,
//           sortBy,
//           sortOrder,
//           status,
//           filter,
//           user
//         );
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );
//   //   fastify.get(
//   //     "/groups/:user",
//   //     { preHandler: [UserAuth] },
//   //     async (request, reply) => {
//   //       try {
//   //         const {
//   //           pageNumber = -1,
//   //           pageSize = 10,
//   //           sortBy = "createdAt",
//   //           sortOrder = "desc",
//   //         } = request.query;
//   //         // If pageNumber is -1, return all
//   //         const { user } = request.params;

//   //         const { data } = await service.GetGroupByUserId(
//   //           pageNumber,
//   //           pageSize,
//   //           sortBy,
//   //           sortOrder,
//   //           user
//   //         );
//   //         reply.code(200).send(data);
//   //       } catch (error) {
//   //         reply.code(500).send(error);
//   //       }
//   //     }
//   //   );
//   fastify.get(
//     "/appointment/:id",
//     { preHandler: [UserAuth] },
//     async (request, reply) => {
//       try {
//         const { id } = request.params;

//         const { data } = await service.GetAppointmentById({ id });
//         reply.code(200).send(data);
//       } catch (error) {
//         reply.code(500).send(error);
//       }
//     }
//   );
// };
