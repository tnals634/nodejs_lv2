const jwt = require("jsonwebtoken");
const User = require("../schemas/user");

module.exports = async (req, res, next) => {
  const { Authorization } = req.cookies;
  // console.log(req.cookies);
  //Bearer asdfadfs.asdasdf.asdf
  //undefined.split(); -> error
  //Authorization 쿠키가 존재하지 않을때 대비
  const [authType, authToken] = (Authorization ?? "").split(" ");

  //authType === bearer
  //authToken 검증
  if (authType !== "Bearer" || !authToken) {
    res.status(403).json({
      errorMessage: "로그인이 필요한 기능입니다.",
    });
    return;
  }

  try {
    //1.authToken이 만료되었는가,
    //2.서버가 발급한 토큰이 맞는가,
    const { userId } = jwt.verify(authToken, "nodejs_lv2_key");

    //3.authToken에 있는 userId에 해당하는 사용자가 db에 존재하는가
    const user = await User.findById(userId);
    res.locals.user = user;

    next(); //이 미들웨어 다음으로 보낸다.
  } catch (error) {
    console.error(error);
    res
      .status(403)
      .json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    return;
  }
};
