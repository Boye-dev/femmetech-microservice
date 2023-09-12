const { UserRepository } = require("../database");
const {
  FormateData,
  GeneratePassword,
  ValidatePassword,
  GenerateSalt,
  GenerateVerificationToken,
  SendEmail,
  GenerateSignature,
  UploadSingleToS3,
} = require("../utils");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../utils/app-errors");
const { verificationEmail, passwordResetEmail } = require("../utils/emails");

class UserService {
  constructor() {
    this.repository = new UserRepository();
  }
  async GetAllUsers() {
    try {
      const users = await this.repository.FindAllUsers({ isVerified: true });
      if (!users) {
        throw new BadRequestError("Users not found", 400);
      }
      return FormateData(users);
    } catch (error) {
      throw new APIError(
        "Error getting users",
        error.statusCode,
        error.message
      );
    }
  }

  async GetUserById({ id }) {
    try {
      const user = await this.repository.FindUserById({ id });
      if (!user) {
        throw new BadRequestError("User not found", 400);
      }
      return FormateData(user);
    } catch (error) {
      throw new APIError("Error getting user", error.statusCode, error.message);
    }
  }

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    try {
      const existingUser = await this.repository.FindUser({ email });
      if (!existingUser) {
        throw new BadRequestError("User not found", 400);
      }
      let salt = existingUser.salt;
      const savedPassword = existingUser.password;
      const isPasswordCorrect = await ValidatePassword(
        password,
        savedPassword,
        salt
      );
      if (!isPasswordCorrect) {
        throw new BadRequestError("Password incorrect", 400);
      }
      if (!existingUser.isVerified) {
        throw new BadRequestError("Please verify your email", 400);
      }
      const token = await GenerateSignature({
        email: existingUser.email,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
        _id: existingUser._id,
        role: existingUser.role,
      });
      return FormateData({ _id: existingUser._id, token });
    } catch (error) {
      throw new APIError("Error signining in", error.statusCode, error.message);
    }
  }

  async SignUp(userInputs) {
    const { firstname, lastname, email, phone, role, password, files } =
      userInputs;

    try {
      const userExists = await this.repository.FindUser({ email });
      if (userExists) {
        throw new BadRequestError("User with this email exists", 400);
      }
      let imageUrl = await UploadSingleToS3(files);
      let salt = await GenerateSalt();
      if (!imageUrl) {
        imageUrl = "http://www.gravatar.com/avatar/?d=mp";
      }

      let userPassword = await GeneratePassword(password, salt);
      const verificationToken = GenerateVerificationToken();
      const createdUser = await this.repository.CreateUser({
        firstname,
        lastname,
        email,
        phone,
        role,
        password: userPassword,
        verificationToken,
        salt,
        profilePicture: imageUrl,
      });
      if (createdUser) {
        const text = verificationEmail(firstname, verificationToken);

        const sendVerificationEmail = await SendEmail(
          email,
          "Email Verification",
          text
        );
        if (!sendVerificationEmail) {
          await this.repository.DeleteUser({ id: createdUser._id });
          throw new BadRequestError("Email Not Sent", 400);
        }
        return FormateData(createdUser);
      }
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error Creating User",
        error.statusCode,
        error.message
      );
    }
  }

  async EditProfile(userInputs) {
    const { firstname, lastname, phone, files, id } = userInputs;

    try {
      let imageUrl = await UploadSingleToS3(files);
      const updateData = {
        firstname,
        lastname,
        phone,
        profilePicture: imageUrl,
      };
      if (!imageUrl) {
        delete updateData.profilePicture;
      }

      const updatedUser = await this.repository.FindUserByIdAndUpdate({
        id,
        updateData,
      });
      if (updatedUser) {
        return FormateData(updatedUser);
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error updating user",
        error.statusCode,
        error.message
      );
    }
  }

  async EditPassword({ newPassword, oldPassword, id }) {
    try {
      const user = await this.repository.FindUserById({ id });
      if (!user) {
        throw new BadRequestError("User does not exist", 400);
      }
      const isPasswordCorrect = await ValidatePassword(
        oldPassword,
        user.password,
        user.salt
      );
      console.log(isPasswordCorrect);
      if (!isPasswordCorrect) {
        throw new BadRequestError("Password is incorrect", 400);
      }
      let salt = await GenerateSalt();

      let userPassword = await GeneratePassword(newPassword, salt);
      user.salt = salt;
      user.password = userPassword;
      const updatedUser = await user.save();
      if (updatedUser) {
        return FormateData({
          updatedUser,
          message: "Password updated successfully",
        });
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error updating password",
        error.statusCode,
        error.message
      );
    }
  }

  async VerifyUser({ verificationToken }) {
    try {
      const existingUser = await this.repository.FindUser({
        verificationToken,
      });
      if (!existingUser) {
        throw new BadRequestError("User does not exist", 400);
      }
      existingUser.isVerified = true;
      existingUser.verificationToken = undefined;
      await existingUser.save();
      return FormateData({
        existingUser,
        message: "User Verified Successfully",
      });
    } catch (error) {
      throw new APIError(
        "Error Verifying User",
        error.statusCode,
        error.message
      );
    }
  }

  async ForgotPassword({ email }) {
    try {
      const existingUser = await this.repository.FindUser({
        email,
      });
      if (!existingUser) {
        throw new BadRequestError("User does not exist", 400);
      }
      const resetPasswordToken = GenerateVerificationToken();
      const resetPasswordExpires = new Date();
      resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1); // Token expires in 1 hour

      existingUser.resetPasswordToken = resetPasswordToken;
      existingUser.resetPasswordExpires = resetPasswordExpires;
      await existingUser.save();

      const text = passwordResetEmail(
        existingUser.firstname,
        resetPasswordToken
      );

      const sendVerificationEmail = await SendEmail(
        email,
        "Password Reset",
        text
      );
      if (!sendVerificationEmail) {
        existingUser.resetPasswordToken = undefined;
        existingUser.resetPasswordExpires = undefined;
        await existingUser.save();
        throw new BadRequestError("Email Not Sent", 400);
      }

      return FormateData({
        message: "Password rest email sent successfully",
      });
    } catch (error) {
      throw new APIError(
        "Error sending reset email",
        error.statusCode,
        error.message
      );
    }
  }

  async ResetPassword({ password, token }) {
    try {
      const existingUser = await this.repository.FindUser({
        resetPasswordToken: token,
      });
      if (!existingUser) {
        throw new BadRequestError("User does not exist", 400);
      }
      if (
        !existingUser.resetPasswordExpires ||
        existingUser.resetPasswordExpires < new Date()
      ) {
        throw new BadRequestError("Password reset token has expired", 400);
      }

      let salt = await GenerateSalt();

      let userPassword = await GeneratePassword(password, salt);

      existingUser.salt = salt;
      existingUser.password = userPassword;
      existingUser.resetPasswordToken = undefined;
      existingUser.resetPasswordExpires = undefined;
      await existingUser.save();

      return FormateData({
        message: "Password reset successfully",
      });
    } catch (error) {
      throw new APIError(
        "Error sending reset email",
        error.statusCode,
        error.message
      );
    }
  }
  async AddShedule({ id, schedule }) {
    try {
      const updateData = {
        schedule,
      };

      const updatedUser = await this.repository.FindUserByIdAndUpdate({
        id,
        updateData,
      });
      if (updatedUser) {
        return FormateData(updatedUser);
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error adding schedule",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = UserService;
