const { AppointmentRepository, UserRepository } = require("../database");
const { FormateData } = require("../utils");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../utils/app-errors");

class AppointmentService {
  constructor() {
    this.repository = new AppointmentRepository();
    this.userRepository = new UserRepository();
  }

  async AddAppointment(userInputs) {
    const { patient, consultant, description, date, startTime, endTime } =
      userInputs;
    try {
      const overlappingAppointment =
        await this.repository.FindOverlappingAppointment(
          date,
          startTime,
          endTime
        );
      const consultantData = await this.userRepository.FindUserById({
        id: consultant,
      });

      if (overlappingAppointment) {
        throw new APIError(
          "Appointment conflict",
          400,
          "Appointment time conflicts with an existing appointment."
        );
      }
      const currentDateTime = new Date();

      // Compare start time with current time
      const startDateTime = new Date(`${date}T${startTime}`);
      if (startDateTime <= currentDateTime) {
        throw new APIError(
          "Invalid start time",
          400,
          "Start time must be in the future."
        );
      }

      // Compare end time with current time
      const endDateTime = new Date(`${date}T${endTime}`);
      if (endDateTime <= currentDateTime) {
        throw new APIError(
          "Invalid end time",
          400,
          "End time must be in the future."
        );
      }

      const dayOfWeek = new Date(date).getDay();
      const dayOfWeekStr = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ][dayOfWeek].toLowerCase();

      const consultantSchedule = consultantData.schedule[dayOfWeekStr];

      if (
        !consultantSchedule ||
        !consultantSchedule.length ||
        consultantSchedule.length < 0
      ) {
        throw new APIError(
          "Consultant's schedule is not available for this day",
          400,
          "Consultant is not available."
        );
      }

      let isWithinSchedule = false;

      for (const { open, close } of consultantSchedule) {
        if (startTime >= open && endTime <= close) {
          isWithinSchedule = true;
          break;
        }
      }

      if (!isWithinSchedule) {
        throw new APIError(
          "Appointment time is outside of consultant's schedule",
          400,
          "Appointment time is outside of the consultant's working hours."
        );
      }
      const newAppointment = await this.repository.CreateAppointment({
        patient,
        consultant,
        description,
        date,
        startTime,
        endTime,
      });

      if (newAppointment) return FormateData(newAppointment);
    } catch (error) {
      throw new APIError(
        "Error creating appointment",
        error.statusCode,
        error.message
      );
    }
  }

  async GetAppointmentsByUserId(
    pageNumber,
    pageSize,
    sortBy,
    sortOrder,
    status,
    filter,
    user
  ) {
    try {
      const appointments = await this.repository.FindAllAppointments(
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        status,
        filter,
        user
      );
      if (appointments) return FormateData(appointments);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get appointments",
        error.statusCode,
        error.message
      );
    }
  }
  async GetGroupByUserId(pageNumber, pageSize, sortBy, sortOrder, user) {
    try {
      const groups = await this.repository.FindAllGroups(
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        user
      );
      if (groups) return FormateData(groups);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get groups",
        error.statusCode,
        error.message
      );
    }
  }
  async GetAppointmentById({ id }) {
    try {
      const appointment = await this.repository.FindAppointmentById({ id });
      if (appointment) return FormateData(appointment);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get appointment",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAppointmentByIdAndUpdateStatus({ id, updateData }) {
    try {
      const { status } = updateData;

      const updatedAppointment =
        await this.repository.FindAppointmentByIdAndUpdate({
          id,
          updateData,
        });
      if (updatedAppointment) {
        return FormateData({
          updatedAppointment,
          message: "Updated successfully",
        });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error updating appointment",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAppointmentByIdAndUpdate({ id, updateData }) {
    try {
      const { consultant, date, endTime, startTime } = updateData;
      const overlappingAppointment =
        await this.repository.FindOverlappingAppointment(
          date,
          startTime,
          endTime
        );
      const consultantData = await this.userRepository.FindUserById({
        id: consultant,
      });

      if (overlappingAppointment) {
        throw new APIError(
          "Appointment conflict",
          400,
          "Appointment time conflicts with an existing appointment."
        );
      }
      const currentDateTime = new Date();

      // Compare start time with current time
      const startDateTime = new Date(`${date}T${startTime}`);
      if (startDateTime <= currentDateTime) {
        throw new APIError(
          "Invalid start time",
          400,
          "Start time must be in the future."
        );
      }

      // Compare end time with current time
      const endDateTime = new Date(`${date}T${endTime}`);
      if (endDateTime <= currentDateTime) {
        throw new APIError(
          "Invalid end time",
          400,
          "End time must be in the future."
        );
      }

      const dayOfWeek = new Date(date).getDay();
      const dayOfWeekStr = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ][dayOfWeek].toLowerCase();

      const consultantSchedule = consultantData.schedule[dayOfWeekStr];

      if (
        !consultantSchedule ||
        !consultantSchedule.length ||
        consultantSchedule.length < 0
      ) {
        throw new APIError(
          "Consultant's schedule is not available for this day",
          400,
          "Consultant is not available."
        );
      }

      let isWithinSchedule = false;

      for (const { open, close } of consultantSchedule) {
        if (startTime >= open && endTime <= close) {
          isWithinSchedule = true;
          break;
        }
      }

      if (!isWithinSchedule) {
        throw new APIError(
          "Appointment time is outside of consultant's schedule",
          400,
          "Appointment time is outside of the consultant's working hours."
        );
      }
      const updatedAppointment =
        await this.repository.FindAppointmentByIdAndUpdate({
          id,
          updateData,
        });
      if (updatedAppointment) {
        return FormateData({
          updatedAppointment,
          message: "Updated successfully",
        });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error updating appointment",
        error.statusCode,
        error.message
      );
    }
  }
  async JoinGroup({ id, user }) {
    try {
      const updatedAppointment = await this.repository.FindAppointmentById({
        id,
      });

      updatedAppointment.members.push({ user });

      const joinedGroup = await updatedAppointment.save();
      if (joinedGroup) {
        return FormateData({ joinedGroup, message: "User Joined Group" });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error joining group",
        error.statusCode,
        error.message
      );
    }
  }
  async FindAppointmentByIdAndDelete({ id }) {
    try {
      const updatedAppointment =
        await this.repository.FindAppointmentByIdAndDelete({
          id,
        });
      if (updatedAppointment) {
        return FormateData({
          deletedAppointment: updatedAppointment,
          message: "Deleted successfully",
        });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error deleting appointment",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = AppointmentService;
