module.exports = {
  databaseConnection: require("./connection"),
  PostRepository: require("./repository/post-repository"),
  UserRepository: require("./repository/user-repository"),
  JournalRepository: require("./repository/journal-repository"),
  ChatRepository: require("./repository/chat-repository"),
  MessageRepository: require("./repository/message-repository"),
  AppointmentRepository: require("./repository/appointment-repository"),
};
