const { JournalRepository } = require("../database");
const { FormateData } = require("../utils");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../utils/app-errors");

class JournalService {
  constructor() {
    this.repository = new JournalRepository();
  }

  async AddJournal(userInputs) {
    const { content, user } = userInputs;
    try {
      const title = content.substring(0, 20);

      const newJournal = await this.repository.CreateJournal({
        content,
        title,
        user,
      });
      if (newJournal) return FormateData(newJournal);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error creating journal",
        error.statusCode,
        error.message
      );
    }
  }

  async GetJournalsByUserId(pageNumber, pageSize, sortBy, sortOrder, user) {
    try {
      const journals = await this.repository.FindAllJournals(
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        user
      );
      if (journals) return FormateData(journals);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get journals",
        error.statusCode,
        error.message
      );
    }
  }
  async GetJournalById({ id }) {
    try {
      const journal = await this.repository.FindJournalById({ id });
      if (journal) return FormateData(journal);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get journal",
        error.statusCode,
        error.message
      );
    }
  }

  async FindJournalByIdAndUpdate({ id, content }) {
    try {
      const title = content.substring(0, 20);
      const updateData = {
        title,
        content,
      };

      const updatedJournal = await this.repository.FindJournalByIdAndUpdate({
        id,
        updateData,
      });
      if (updatedJournal) {
        return FormateData({ updatedJournal, message: "Updated successfully" });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error updating journal",
        error.statusCode,
        error.message
      );
    }
  }
  async FindJournalByIdAndDelete({ id }) {
    try {
      const updatedJournal = await this.repository.FindJournalByIdAndDelete({
        id,
      });
      if (updatedJournal) {
        return FormateData({
          deletedJournal: updatedJournal,
          message: "Deleted successfully",
        });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error deleting journal",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = JournalService;
