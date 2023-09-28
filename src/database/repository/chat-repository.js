const { ChatModel } = require("../models");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../../utils/app-errors");

class ChatRepository {
  async CreateChat({ isGroupChat, members, groupAdmin, groupName }) {
    try {
      const createdChat = new ChatModel({
        isGroupChat,
        members,
        groupAdmin,
        groupName,
      });
      const chatResult = await createdChat.save();
      return chatResult;
    } catch (error) {
      throw new APIError(
        "Error Creating Chat",
        error.statusCode,
        error.message
      );
    }
  }

  async FindChatByIdAndUpdate({ id, updateData }) {
    try {
      const updatedChat = await ChatModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return updatedChat;
    } catch (error) {
      throw new APIError(
        "Unable to find chat",
        error.statusCode,
        error.message
      );
    }
  }

  async FindChatByIdAndDelete({ id }) {
    try {
      const updatedChat = await ChatModel.findByIdAndDelete(id);

      return updatedChat;
    } catch (error) {
      throw new APIError(
        "Unable to delete journal",
        error.statusCode,
        error.message
      );
    }
  }
  async FindChatById({ id }) {
    try {
      const chat = await ChatModel.findById(id);

      return chat;
    } catch (error) {
      throw new APIError(
        "Unable to find chat",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAllChats(pageNumber, pageSize, sortBy, sortOrder, user) {
    try {
      let query = ChatModel.find({ "members.user": user, isGroupChat: false });

      if (pageNumber != -1) {
        const skip = (pageNumber - 1) * pageSize;
        query = query.skip(skip).limit(pageSize);
      }

      const totalCount = await ChatModel.countDocuments({
        "members.user": user,
        isGroupChat: false,
      });

      const validSortOrder = sortOrder === "asc" ? 1 : -1;

      const sort = { [sortBy]: validSortOrder };
      query = query.sort(sort);

      const chats = await query
        .populate({
          path: "members.user",
          select: "firstname lastname profilePicture",
        })
        .exec();
      const paginatedChats = { chats, totalCount, pageNumber, pageSize };

      return paginatedChats;
    } catch (error) {
      throw new APIError(
        "Unable to find chats",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAllGroups(pageNumber, pageSize, sortBy, sortOrder, user) {
    try {
      let query = ChatModel.find({ "members.user": user, isGroupChat: true });

      if (pageNumber != -1) {
        const skip = (pageNumber - 1) * pageSize;
        query = query.skip(skip).limit(pageSize);
      }

      const totalCount = await ChatModel.countDocuments({
        "members.user": user,
        isGroupChat: true,
      });

      const validSortOrder = sortOrder === "asc" ? 1 : -1;

      const sort = { [sortBy]: validSortOrder };
      query = query.sort(sort);

      const groups = await query
        .populate({
          path: "members.user",
          select: "firstname lastname profilePicture",
        })
        .exec();
      const paginatedGroups = { groups, totalCount, pageNumber, pageSize };

      return paginatedGroups;
    } catch (error) {
      throw new APIError(
        "Unable to find groups",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = ChatRepository;
