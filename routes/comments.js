const express = require("express");
const router = express.Router();

const Posts = require("../schemas/post");
const Comments = require("../schemas/comment");
const Users = require("../schemas/user");
const authMiddleware = require("../middlewares/auth-middleware");

//댓글 작성 API
router.post("/posts/:postId/comments", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;
  const { userId } = res.locals.user;

  try {
    const post = await Posts.findOne({ _id: postId });
    const user = await Users.findOne({ _id: userId });

    if (!post) {
      return res.status(404).json({
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    } else if (!comment) {
      return res.status(412).json({
        errorMessage: "댓글 내용을 입력해주세요.",
      });
    }

    await Comments.create({
      userId,
      postId,
      comment,
      nickname: user.nickname,
    });

    res.status(201).json({ message: "댓글을 작성하였습니다." });
  } catch (error) {
    return res.status(400).json({
      errorMessage: "댓글 작성에 실패하였습니다.",
    });
  }
});

//댓글 목록 조회
router.get("/posts/:postId/comments", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Posts.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    }

    const comments = await Comments.find({ postId: postId });
    const results = comments.map((item) => {
      return {
        commentId: item._id,
        userId: item.userId,
        nickname: item.nickname,
        comment: item.comment,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.json({ comments: results });
  } catch (error) {
    return res.status(400).json({
      errorMessage: "댓글 조회에 실패하였습니다.",
    });
  }
});

//댓글 수정 API
router.put(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { comment } = req.body;
    const { userId } = res.locals.user;

    try {
      const post = await Posts.findOne({ _id: postId });
      const comments = await Comments.findOne({ _id: commentId });

      if (!post) {
        return res.status(404).json({
          errorMessage: "게시글이 존재하지 않습니다.",
        });
      } else if (!comments) {
        return res.status(404).json({
          errorMessage: "댓글이 존재하지 않습니다.",
        });
      } else if (userId !== comments.userId) {
        return res.status(403).json({
          errorMessage: "댓글 수정 권한이 존재하지 않습니다.",
        });
      } else if (!comment) {
        return res.status(412).json({
          errorMessage: "댓글 내용을 입력해주세요.",
        });
      }

      await Comments.updateOne(
        { userId, postId, _id: commentId },
        {
          $set: {
            comment: comment,
          },
        }
      );

      res.json({ message: "댓글을 수정하였습니다." });
    } catch (error) {
      return res.status(400).json({
        errorMessage: "댓글 수정이 정상적으로 처리되지 않았습니다.",
      });
    }
  }
);

//댓글 삭제 API
router.delete(
  "/posts/:postId/comments/:commentId",
  authMiddleware,
  async (req, res) => {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;

    try {
      const post = await Posts.findOne({ _id: postId });
      const comment = await Comments.findOne({ _id: commentId });
      if (!post) {
        return res
          .status(404)
          .json({ errorMessage: "게시글이 존재하지 않습니다." });
      } else if (userId !== comment.userId) {
        return res
          .status(403)
          .json({ errorMessage: "댓글의 삭제 권한이 존재하지 않습니다." });
      } else if (!comment) {
        return res
          .status(404)
          .json({ errorMessage: "댓글이 존재하지 않습니다." });
      }

      await Comments.deleteOne({ _id: commentId, userId, postId });

      res.json({ message: "댓글을 삭제하였습니다." });
    } catch (error) {
      return res
        .status(400)
        .json({ errorMessage: "댓글 삭제에 실패하였습니다." });
    }
  }
);

module.exports = router;
