const Prisma = require("../../database/prisma");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const STATUS = require("../../shared-utils/status-code");

// prisma instance
const { prisma } = new Prisma();

const authenticateToken = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token)
      return res.status(STATUS.UNAUTHORIZED).json({
        message: "You are not logged in. Please login to get access",
      });
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(STATUS.UNAUTHORIZED).json({
          message: "Invalid Token, Login again",
        });
      } else if (error.name === "TokenExpiredError") {
        return res.status(STATUS.UNAUTHORIZED).json({
          message: "Your session token expired, Login again",
        });
      }
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        userId: decoded.user,
      },
      include: {
        userRole: true,
        fieldOfInterest:true,
      }
    });

    if (!currentUser) {
      return res.status(STATUS.UNAUTHORIZED).json({
        message: "The user belonging to this session does not longer exist",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
    authenticateToken
}