const { JournalModel } = require("../models");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../../utils/app-errors");

class JournalRepository {
  async CreateJournal({ content, title, user }) {
    try {
      const createdJournal = new JournalModel({ content, title, user });
      const journalResult = await createdJournal.save();
      return journalResult;
    } catch (error) {
      throw new APIError(
        "Error Creating Journal",
        error.statusCode,
        error.message
      );
    }
  }

  async FindJournalByIdAndUpdate({ id, updateData }) {
    try {
      const updatedJournal = await JournalModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        }
      );

      return updatedJournal;
    } catch (error) {
      throw new APIError(
        "Unable to find journal",
        error.statusCode,
        error.message
      );
    }
  }
  async FindJournalByIdAndDelete({ id }) {
    try {
      const updatedJournal = await JournalModel.findByIdAndDelete(id);

      return updatedJournal;
    } catch (error) {
      throw new APIError(
        "Unable to delete journal",
        error.statusCode,
        error.message
      );
    }
  }
  async FindJournalById({ id }) {
    try {
      const journal = await JournalModel.findById(id);

      return journal;
    } catch (error) {
      throw new APIError(
        "Unable to find journal",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAllJournals(pageNumber, pageSize, sortBy, sortOrder, user) {
    try {
      let query = JournalModel.find({ user });

      if (pageNumber != -1) {
        const skip = (pageNumber - 1) * pageSize;
        query = query.skip(skip).limit(pageSize);
      }

      const totalCount = await JournalModel.countDocuments();

      const validSortOrder = sortOrder === "asc" ? 1 : -1;

      const sort = { [sortBy]: validSortOrder };
      query = query.sort(sort);

      const journals = await query
        .populate({
          path: "user",
          select: "firstname lastname profilePicture",
        })
        .exec();
      const paginatedJournals = { journals, totalCount, pageNumber, pageSize };

      return paginatedJournals;
    } catch (error) {
      throw new APIError(
        "Unable to find journals",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = JournalRepository;
