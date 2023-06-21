const express = require("express");
const router = express.Router();
const User = require("../schemas/user.js");
const jwt = require("jsonwebtoken");

//로그인 API
router.post("/login", async (req, res) => {
  const { nickname, password } = req.body;

  const user = await User.findOne({ nickname });

  //1.이메일에 일치하는 유저가 존재하지 않거나
  //2.유저를 찾았지만 비밀번호가 일치하지 않았을 경우
  if (!user || user.password !== password) {
    res.status(400).json({
      errorMessage: "닉네임 또는 패스워드를 확인해주세요.",
    });
    return;
  }

  try {
    if (user.nickname === nickname && user.password === password) {
      //jwt를 생성
      const token = jwt.sign({ userId: user.userId }, "nodejs_lv2_key");

      res.cookie("Authorization", `Bearer ${token}`);
      res.status(200).json({ token });
    }
  } catch (error) {
    res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
  }
});

module.exports = router;
