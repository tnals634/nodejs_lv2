const express = require("express");
const router = express.Router();

const Posts = require("../schemas/post");
const Users = require("../schemas/user");
const authMiddleware = require("../middlewares/auth-middleware");

//게시글 작성 API
router.post("/posts", authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { userId } = res.locals.user;

  const user = await Users.findOne({ _id: userId });

  if (!title || !content) {
    return res.status(412).json({
      errorMessage: "데이터 형식이 올바르지 않습니다.",
    });
  } else if (typeof title !== "string") {
    return res.status(412).json({
      errorMessage: "게시글 제목의 형식이 일치하지 않습니다.",
    });
  } else if (typeof content !== "string") {
    return res.status(412).json({
      errorMessage: "게시글 내용의 형식이 일치하지 않습니다.",
    });
  }

  try {
    await Posts.create({
      userId,
      nickname: user.nickname,
      title,
      content,
    });

    return res.status(201).json({ message: "게시글 작성에 성공하였습니다." });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 작성에 실패하였습니다." });
  }
});

//게시글 목록 조회 API
router.get("/posts", async (req, res) => {
  const posts = await Posts.find({}).sort("-createdAt").exec();

  try {
    const results = posts.map((item) => {
      return {
        postId: item._id,
        userId: item.userId,
        nickname: item.nickname,
        title: item.title,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.json({ posts: results });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

//게시글 상세 조회 API
router.get("/posts/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Posts.find({ _id: postId });
    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글 조회에 실패하였습니다." });
    }
    const result = post.map((item) => {
      return {
        postId: item._id,
        userId: item.userId,
        nickname: item.nickname,
        title: item.title,
        content: item.content,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    res.json({ post: result });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

//게시글 수정 API
router.put("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const { userId } = res.locals.user;

  try {
    const post = await Posts.find({ _id: postId });

    if (!post) {
      return res.status(404).json({
        errorMessage: "게시글이 존재하지 않습니다.",
      });
    } else if (!title || !content) {
      return res.status(412).json({
        errorMessage: "데이터 형식이 올바르지 않습니다.",
      });
    } else if (typeof title !== "string") {
      return res.status(412).json({
        errorMessage: "게시글 제목의 형식이 일치하지 않습니다.",
      });
    } else if (typeof content !== "string") {
      return res.status(412).json({
        errorMessage: "게시글 내용의 형식이 일치하지 않습니다.",
      });
    } else if (userId !== post.userId) {
      return res.status(412).json({
        errorMessage: "게시글 수정권한이 없습니다.",
      });
    }

    await Posts.updateOne(
      { userId, _id: postId },
      {
        $set: {
          title: title,
          content: content,
        },
      }
    );

    res.json({ message: "게시글을 수정하였습니다." });
  } catch (error) {
    return res
      .status(400)
      .json({ errorMessage: "게시글 수정에 실패하였습니다." });
  }
});

//게시글 삭제 API
router.delete("/posts/:postId", authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const { userId } = res.locals.user;

  try {
    const post = await Posts.find({ _id: postId });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: "게시글이 존재하지 않습니다." });
    } else if (userId !== post.userId) {
      return res.status(403).json({
        errorMessage: "게시글의 삭제 권한이 존재하지 않습니다.",
      });
    }

    await Posts.deleteOne({ userId, _id: postId });

    res.json({ message: "게시글을 삭제하였습니다." });
  } catch (error) {
    return res.status(401).json({
      errorMessage: "게시글이 정상적으로 삭제되지 않았습니다.",
    });
  }
});

module.exports = router;
