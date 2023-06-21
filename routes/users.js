// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../schemas/user.js");

// 회원가입 API
router.post("/signup", async (req, res) => {
  const { nickname, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).json({
      errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
    });
    return;
  }

  // nickname이 동일한 데이터가 있는지 확인하기 위해 가져온다.
  const existsUsers = await User.findOne({ nickname });
  if (existsUsers) {
    // NOTE: 보안을 위해 인증 메세지는 자세히 설명하지 않습니다.
    res.status(400).json({
      errorMessage: "닉네임이 이미 사용중입니다.",
    });
    return;
  }

  //데이터 형식이 맞는지 검사
  const scriptTag = /[~!@#\$%\^&\*\(\)_\+\-={}\[\];:<>,\.\/\?\"\'\/\|\\]/; // 특수문자들
  const validationNickname = /^(?=.*[a-zA-Z])(?=.*[0-9]).{3,20}$/;
  const validationPassword =
    /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{4,25}$/;

  if (
    validationNickname.test(nickname) === false ||
    scriptTag.test(nickname) === true
  ) {
    return res.status(412).json({
      errorMessage: "닉네임의 형식이 일치하지 않습니다.",
    });
  } else if (validationPassword.test(password) === false) {
    return res.status(412).json({
      errorMessage: "password의 형식이 일치하지 않습니다.",
    });
  } else if (password !== confirmPassword) {
    return res.status(412).json({
      errorMessage: "패스워드가 일치하지 않습니다.",
    });
  }

  const pwdSamNickname = password.search(nickname);

  if (pwdSamNickname > -1) {
    return res.status(412).json({
      errorMessage: "password는 닉네임을 포함할 수 없습니다.",
    });
  }

  try {
    const user = new User({ nickname, password });
    await user.save();

    res.status(201).json({ message: "회원 가입에 성공하였습니다." });
  } catch (error) {
    res
      .status(400)
      .json({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
});

module.exports = router;
