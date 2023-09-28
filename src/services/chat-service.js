const { ChatRepository } = require("../database");
const { FormateData } = require("../utils");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../utils/app-errors");

class ChatService {
  constructor() {
    this.repository = new ChatRepository();
  }

  async AddChat(userInputs) {
    const { groupAdmin, members, isGroupChat, groupName } = userInputs;
    try {
      const newChat = await this.repository.CreateChat({
        members,
        groupAdmin,
        isGroupChat,
        groupName,
      });
      if (newChat) return FormateData(newChat);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error creating chat",
        error.statusCode,
        error.message
      );
    }
  }

  async GetChatsByUserId(pageNumber, pageSize, sortBy, sortOrder, user) {
    try {
      const chats = await this.repository.FindAllChats(
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        user
      );
      if (chats) return FormateData(chats);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get chats",
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
  async GetChatById({ id }) {
    try {
      const chat = await this.repository.FindChatById({ id });
      if (chat) return FormateData(chat);
      return FormateData(null);
    } catch (error) {
      throw new APIError("Unable to get chat", error.statusCode, error.message);
    }
  }

  async FindChatByIdAndUpdate({ id, updateData }) {
    try {
      const updatedChat = await this.repository.FindChatByIdAndUpdate({
        id,
        updateData,
      });
      if (updatedChat) {
        return FormateData({ updatedChat, message: "Updated successfully" });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error updating chat",
        error.statusCode,
        error.message
      );
    }
  }
  async JoinGroup({ id, user }) {
    try {
      const updatedChat = await this.repository.FindChatById({
        id,
      });

      updatedChat.members.push({ user });

      const joinedGroup = await updatedChat.save();
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
  async FindChatByIdAndDelete({ id }) {
    try {
      const updatedChat = await this.repository.FindChatByIdAndDelete({
        id,
      });
      if (updatedChat) {
        return FormateData({
          deletedChat: updatedChat,
          message: "Deleted successfully",
        });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error deleting chat",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = ChatService;
