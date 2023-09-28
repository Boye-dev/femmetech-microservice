const { MessageModel } = require("../models");

const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../../utils/app-errors");

class MessageRepository {
  async CreateMessage({ content, chat, sender }) {
    try {
      const createdMessage = new MessageModel({
        content,
        chat,
        sender,
      });
      const messageResult = await createdMessage.save();

      return messageResult.populate({
        path: "sender",
        select: "firstname lastname profilePicture",
      });
    } catch (error) {
      throw new APIError(
        "Error Creating Message",
        error.statusCode,
        error.message
      );
    }
  }

  async FindMessageByIdAndUpdate({ id, updateData }) {
    try {
      const updatedMessage = await MessageModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
        }
      );

      return updatedMessage;
    } catch (error) {
      throw new APIError(
        "Unable to find message",
        error.statusCode,
        error.message
      );
    }
  }

  async FindMessageByIdAndDelete({ id }) {
    try {
      const updatedMessage = await MessageModel.findByIdAndDelete(id);

      return updatedMessage;
    } catch (error) {
      throw new APIError(
        "Unable to delete journal",
        error.statusCode,
        error.message
      );
    }
  }
  async FindMessageById({ id }) {
    try {
      const message = await MessageModel.findById(id);

      return message;
    } catch (error) {
      throw new APIError(
        "Unable to find message",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAllMessages(pageNumber, pageSize, sortBy, sortOrder, chat) {
    try {
      let query = MessageModel.find({
        chat,
      }).populate({
        path: "sender",
        select: "firstname lastname profilePicture",
      });

      const messages = await query.exec();

      return messages;
    } catch (error) {
      throw new APIError(
        "Unable to find messages",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = MessageRepository;
