const { PostRepository } = require("../database");
const { UploadMultipleToS3, FormateData } = require("../utils");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../utils/app-errors");

class PostService {
  constructor() {
    this.repository = new PostRepository();
  }

  async AddPost(userInputs) {
    const { files, text, user } = userInputs;
    try {
      const imageUrls = await UploadMultipleToS3(files);
      if (!imageUrls) {
        imageUrls = [];
      }
      const newPost = await this.repository.CreatePost({
        user,
        text,
        images: imageUrls,
      });
      if (newPost) return FormateData(newPost);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error creating post",
        error.statusCode,
        error.message
      );
    }
  }
  async AddComment({ text, user, id }) {
    try {
      const post = await this.repository.FindPostById({ id });
      const newComment = {
        user,
        text,
        createdAt: new Date(),
      };

      post.comments.push(newComment);

      const savedPost = await post.save();

      if (savedPost) {
        await savedPost.populate({
          path: "comments.user",
          select: "firstname lastname profilePicture",
        });

        return FormateData(savedPost);
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error creating comment",
        error.statusCode,
        error.message
      );
    }
  }

  async GetPosts(pageNumber, pageSize, sortBy, sortOrder) {
    try {
      const posts = await this.repository.FindAllPosts(
        pageNumber,
        pageSize,
        sortBy,
        sortOrder
      );
      if (posts) return FormateData(posts);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get posts",
        error.statusCode,
        error.message
      );
    }
  }
  async GetPostById({ id }) {
    try {
      const posts = await this.repository.FindPostById({ id });
      if (posts) return FormateData(posts);
      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Unable to get posts",
        error.statusCode,
        error.message
      );
    }
  }
  async LikePost({ id, userId }) {
    try {
      const post = await this.repository.FindPostById({ id });

      if (!post) {
        throw new BadRequestError("Post not found", 400);
      }

      const hasLiked = post.likes.find(
        (item) => item.user.toString() === userId
      );

      if (hasLiked) {
        throw new BadRequestError("Post has been liked by you", 400);
      }
      post.likes.push({ user: userId });

      const postLiked = await post.save();
      if (postLiked) {
        return FormateData({ postLiked, message: "Post Liked Successfully" });
      }
      return FormateData(null);
    } catch (error) {
      throw new APIError("Error liking post", error.statusCode, error.message);
    }
  }
}

module.exports = PostService;
