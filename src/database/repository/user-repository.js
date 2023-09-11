const { UserModel } = require("../models");
const { APIError } = require("../../utils/app-errors");

class UserRepository {
  async CreateUser({
    firstname,
    lastname,
    email,
    phone,
    role,
    password,
    verificationToken,
    salt,
    profilePicture,
  }) {
    try {
      const user = new UserModel({
        firstname,
        lastname,
        email,
        phone,
        role,
        password,
        verificationToken,
        salt,
        profilePicture,
      });

      const userResult = await user.save();
      return userResult;
    } catch (error) {
      throw new APIError(
        "Unable to create user",
        error.statusCode,
        error.message
      );
    }
  }
  async DeleteUser({ id }) {
    try {
      const user = await UserModel.findByIdAndDelete(id);

      return user;
    } catch (error) {
      throw new APIError(
        "Unable to delete user",
        error.statusCode,
        error.message
      );
    }
  }

  async FindUser(param) {
    try {
      const existingUser = await UserModel.findOne(param);
      return existingUser;
    } catch (error) {
      throw new APIError("Error to find user", error.statusCode, error.message);
    }
  }
  async FindAllUsers(params = {}) {
    try {
      const users = await UserModel.find(params);
      return users;
    } catch (error) {
      throw new APIError(
        "Unable to get users",
        error.statusCode,
        error.message
      );
    }
  }
  async FindUserById({ id }) {
    try {
      const existingUser = await UserModel.findById(id);
      return existingUser;
    } catch (error) {
      throw new APIError("Unable to get user", error.statusCode, error.message);
    }
  }
  async FindUserByIdAndUpdate({ id, updateData }) {
    try {
      const existingUser = await UserModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      return existingUser;
    } catch (error) {
      throw new APIError(
        "Unable to update user",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = UserRepository;
