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
    const { files, text, userId } = userInputs;
    try {
      const imageUrls = await UploadMultipleToS3(files);
      const newPost = await this.repository.CreatePost({
        userId,
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
  async AddComment({ text, userId, id }) {
    try {
      const post = await this.repository.FindPostById({ id });
      const newComment = {
        userId: userId,
        text: text,
      };

      post.comments.push(newComment);

      const savedPost = await post.save();

      if (savedPost) {
        return FormateData(savedPost);
      }

      return FormateData(null);
    } catch (error) {
      throw new APIError(
        "Error creating post",
        error.statusCode,
        error.message
      );
    }
  }

  async GetPosts(pageNumber = 1, pageSize = 10) {
    try {
      const posts = await this.repository.FindAllPosts(pageNumber, pageSize);
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

  async LikePost({ id }) {
    try {
      const post = await this.repository.FindPostById({ id });

      if (!post) {
        throw new BadRequestError("Post not found", 400);
      }
      let likes = post.likes;
      post.likes = likes + 1;
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
