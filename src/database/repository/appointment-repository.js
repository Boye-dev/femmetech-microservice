const { AppointmentModel } = require("../models");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../../utils/app-errors");

class AppointmentRepository {
  async CreateAppointment({
    patient,
    consultant,
    description,
    date,
    startTime,
    endTime,
  }) {
    try {
      const createdAppointment = new AppointmentModel({
        patient,
        consultant,
        description,
        date,
        startTime,
        endTime,
      });
      const appointmentResult = await createdAppointment.save();
      return appointmentResult;
    } catch (error) {
      throw new APIError(
        "Error Creating Appointment",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAppointmentByIdAndUpdate({ id, updateData }) {
    try {
      const updatedAppointment = await AppointmentModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        }
      );

      return updatedAppointment;
    } catch (error) {
      throw new APIError(
        "Unable to find appointment",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAppointmentByIdAndDelete({ id }) {
    try {
      const updatedAppointment = await AppointmentModel.findByIdAndDelete(id);

      return updatedAppointment;
    } catch (error) {
      throw new APIError(
        "Unable to delete journal",
        error.statusCode,
        error.message
      );
    }
  }
  async FindAppointmentById({ id }) {
    try {
      const appointment = await AppointmentModel.findById(id)
        .populate({
          path: "patient",
          select: "firstname lastname profilePicture",
        })
        .populate({
          path: "consultant",
          select: "firstname lastname profilePicture",
        });

      return appointment;
    } catch (error) {
      throw new APIError(
        "Unable to find appointment",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAllAppointments(
    pageNumber,
    pageSize,
    sortBy,
    sortOrder,
    status,
    filter,
    user
  ) {
    try {
      console.log(filter);
      let query = AppointmentModel.find({
        $or: [{ patient: user }, { consultant: user }],
        status,
      });

      if (pageNumber != -1) {
        const skip = (pageNumber - 1) * pageSize;
        query = query.skip(skip).limit(pageSize);
      }
      if (filter === "UPCOMING") {
        const currentDateTime = new Date();
        query = query.where("date").gte(currentDateTime);

        // To account for both date and time, create a combined datetime string
        const currentDateTimeString =
          currentDateTime.toISOString().split("T")[0] +
          "T" +
          currentDateTime.toISOString().split("T")[1].substring(0, 5);
        query = query.or([
          {
            $and: [
              { date: currentDateTimeString },
              { endTime: { $gte: currentDateTimeString.split("T")[1] } },
            ],
          },
          { $expr: { $gt: ["$date", currentDateTimeString] } },
        ]);
      } else if (filter === "PAST") {
        const currentDateTime = new Date();
        query = query.where("date").lt(currentDateTime);

        // To account for both date and time, create a combined datetime string
        const currentDateTimeString =
          currentDateTime.toISOString().split("T")[0] +
          "T" +
          currentDateTime.toISOString().split("T")[1].substring(0, 5);
        query = query.or([
          {
            $and: [
              { date: currentDateTimeString },
              { endTime: { $lt: currentDateTimeString.split("T")[1] } },
            ],
          },
          { $expr: { $lt: ["$date", currentDateTimeString] } },
        ]);
      }

      const totalCount = await AppointmentModel.countDocuments({
        $or: [{ patient: user }, { consultant: user }],
      });

      const validSortOrder = sortOrder === "asc" ? 1 : -1;

      const sort = { [sortBy]: validSortOrder };
      query = query.sort(sort);

      const appointments = await query
        .populate({
          path: "patient",
          select: "firstname lastname profilePicture",
        })
        .populate({
          path: "consultant",
          select: "firstname lastname profilePicture",
        })
        .exec();
      const paginatedAppointments = {
        appointments,
        totalCount,
        pageNumber,
        pageSize,
      };

      return paginatedAppointments;
    } catch (error) {
      throw new APIError(
        "Unable to find appointments",
        error.statusCode,
        error.message
      );
    }
  }
  async FindOverlappingAppointment(date, startTime, endTime) {
    try {
      const overlappingAppointment = await AppointmentModel.findOne({
        date,
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
          { startTime: { $gte: startTime, $lt: endTime } },
          { endTime: { $gt: startTime, $lte: endTime } },
        ],
        status: "SCHEDULED",
      });

      return overlappingAppointment;
    } catch (error) {
      throw new APIError(
        "Unable to find appointments",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = AppointmentRepository;
