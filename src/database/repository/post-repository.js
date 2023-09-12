const { PostModel } = require("../models");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../../utils/app-errors");

class PostRepository {
  async CreatePost({ user, text, images }) {
    try {
      const createdPost = new PostModel({ user, text, images });
      const postResult = await createdPost.save();
      return postResult;
    } catch (error) {
      throw new APIError(
        "Error Creating Post",
        error.statusCode,
        error.message
      );
    }
  }

  async FindPostByIdAndUpdate({ id, updateData }) {
    try {
      const updatedPost = await PostModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return updatedPost;
    } catch (error) {
      throw new APIError(
        "Unable to find post",
        error.statusCode,
        error.message
      );
    }
  }
  async FindPostById({ id }) {
    try {
      const post = await PostModel.findById(id);

      return post;
    } catch (error) {
      throw new APIError(
        "Unable to find post",
        error.statusCode,
        error.message
      );
    }
  }

  async FindAllPosts(pageNumber, pageSize, sortBy, sortOrder) {
    try {
      let query = PostModel.find({});

      if (pageNumber != -1) {
        const skip = (pageNumber - 1) * pageSize;
        query = query.skip(skip).limit(pageSize);
      }

      const totalCount = await PostModel.countDocuments();

      const validSortOrder = sortOrder === "asc" ? 1 : -1;

      const sort = { [sortBy]: validSortOrder };
      query = query.sort(sort);

      const posts = await query
        .populate({
          path: "user",
          select: "firstname lastname profilePicture",
        })
        .populate({
          path: "comments.user",
          select: "firstname lastname profilePicture",
        })
        .exec();
      const paginatedPosts = { posts, totalCount, pageNumber, pageSize };

      return paginatedPosts;
    } catch (error) {
      throw new APIError(
        "Unable to find posts",
        error.statusCode,
        error.message
      );
    }
  }
}

module.exports = PostRepository;
