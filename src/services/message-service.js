const { MessageRepository } = require("../database");
const { FormateData, UploadMultipleToS3WithFileType } = require("../utils");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../utils/app-errors");

class MessageService {
  constructor() {
    this.repository = new MessageRepository();
  }

  async AddMessage(userInputs) {
    const { files, text, chat, sender } = userInputs;

    try {
      const imageUrls = await UploadMultipleToS3WithFileType(files);
      if (!imageUrls) {
        imageUrls = undefined;
      }
      const content = {
        files: imageUrls,
        text,
      };
      const newMessage = await this.repository.CreateMessage({
        content,
        chat,
        sender,
      });

      if (newMessage) return FormateData(newMessage);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error creating message",
        error.statusCode,
        error.message
      );
    }
  }

  async GetMessagesByChatId(pageNumber, pageSize, sortBy, sortOrder, chat) {
    try {
      const messages = await this.repository.FindAllMessages(
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        chat
      );
      if (messages) return FormateData(messages);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get messages",
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
  async GetMessageById({ id }) {
    try {
      const message = await this.repository.FindMessageById({ id });
      if (message) return FormateData(message);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get message",
        error.statusCode,
        error.message
      );
    }
  }

  async FindMessageByIdAndUpdate({ id, updateData }) {
    try {
      const updatedMessage = await this.repository.FindMessageByIdAndUpdate({
        id,
        updateData,
      });
      if (updatedMessage) {
        return FormateData({ updatedMessage, message: "Updated successfully" });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error updating message",
        error.statusCode,
        error.message
      );
    }
  }
  async JoinGroup({ id, user }) {
    try {
      const updatedMessage = await this.repository.FindMessageById({
        id,
      });

      updatedMessage.members.push({ user });

      const joinedGroup = await updatedMessage.save();
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
  async FindMessageByIdAndDelete({ id }) {
    try {
      const updatedMessage = await this.repository.FindMessageByIdAndDelete({
        id,
      });
      if (updatedMessage) {
        return FormateData({
          deletedMessage: updatedMessage,
          message: "Deleted successfully",
        });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error deleting message",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = MessageService;
