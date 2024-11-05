const crypto = require("crypto");
const { validationResult } = require("express-validator");
const STATUS = require("../../shared-utils/status-code");
const Prisma = require("../../database/prisma");
const authHelper = require("../utils/auth.utils");
const Email = require("../../shared-utils/email");

// Prisma instance
const { prisma } = new Prisma();

class AuthController {
  async isUserExist(username) {
    return prisma.user.findFirst({
      where: {
        OR: [
          {username:username},
          {Employee: {some: {email: username}}},
          {Driver: {some: {email: username}}},
        ]
      },
    });
  }

  async login(req, res) {
    const { email, password } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS.BAD_REQUEST).json({ message: errors.array() });
    }

    try {
      const user = await this.isUserExist(email);

      if (!user) {
        return res
          .status(STATUS.NOTFOUND)
          .json({ message: "Invalid Credentials" });
      }

      const passwordMatch = await authHelper.comparePasswords(
        password,
        user.password
      );
      if (!passwordMatch) {
        return res
          .status(STATUS.NOTFOUND)
          .json({ message: "Invalid Credentials" });
      }

      const accessToken = authHelper.generateAccessToken(user.userId);

      res.status(STATUS.OK).json({
        data: {
          token: accessToken,
          user
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  async register(req, res) {
    const {
      username,
      email,
      password,
      userType,
      firstName,
      lastName,
      branchId,
      phoneNumber,
    } = req.body;

    try {
      // Check if the user already exists
      let user = await this.isUserExist(username);
      if (user) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "User Already Exists" });
      }

      // Hash the password
      const hashedPassword = await authHelper.hashPassword(password);

      // Create the new user
      const newUser = await prisma.user.create({
        data: {
          username: username,
          password: hashedPassword,
          isFirstLogin: true,
          statusId: 1, // or any default statusId
          type: {
            connect: {
              id: userType
            }
          }
        },
      });

      // Based on userType, create either an Employee or Driver
      let userDetail;
      if (userType === 1) {
        // Create an Employee if userType is 1
        userDetail = await prisma.employee.create({
          data: {
            user: {
              connect: {
                id: newUser.id
              }
            },
            email,
            firstName,
            lastName,
            branchId,
          },
        });
      } else if (userType === 2) {
        // Create a Driver if userType is 2
        userDetail = await prisma.driver.create({
          data: {
            user: {
              connect: {
                id: newUser.id
              }
            },
            email,
            firstName,
            lastName,
            branch: {
              connect: {
                id: branchId
              }
            },
            phoneNumber,
          },
        });
      } else {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Invalid User Type" });
      }

      // Generate an access token
      const accessToken = authHelper.generateAccessToken(newUser.id);

      res.status(STATUS.CREATED).json({
        data: {
          token: accessToken,
          user,
          details: userDetail, 
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  async forgetPassword(req, res) {
    const { email } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS.BAD_REQUEST).json({ message: errors.array() });
    }

    try {
      const user = await this.isUserExist(email);

      if (!user) {
        return res
          .status(STATUS.NOTFOUND)
          .json({ message: "User doesn't exist" });
      }

      const { resetToken, passwordResetToken, passwordResetExpires } =
        authHelper.generateResetPasswordToken();

      await prisma.verificationToken.upsert({
        where: {
          userId_type: { userId: user.userId, type: "RESET_PASSWORD" },
        },
        update: {
          value: passwordResetToken,
          expiresAt: new Date(passwordResetExpires),
        },
        create: {
          userId: user.userId,
          value: passwordResetToken,
          expiresAt: new Date(passwordResetExpires),
          type: "RESET_PASSWORD",
        },
      });

      const emailInstance = new Email(user);

      await emailInstance.sendPasswordReset(resetToken);

      res
        .status(STATUS.OK)
        .json({ message: "Password reset email sent successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  async resetPassword(req, res) {
    const { password, token } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    try {
      const verificationToken = await prisma.verificationToken.findFirst({
        where: { value: hashedToken },
      });

      if (!verificationToken || verificationToken.expiresAt < new Date()) {
        return res.status(STATUS.BAD_REQUEST).json({
          message: "The token is invalid or expired. Please request a new one.",
        });
      }

      await prisma.user.update({
        where: { userId: verificationToken.userId },
        data: { password: await authHelper.hashPassword(password) },
      });

      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      res.status(STATUS.OK).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  async changePassword(req, res) {
    const { newPassword, currentPassword } = req.body;
    try {
      // check for the password
      const passwordMatch = await authHelper.comparePasswords(
        currentPassword,
        req.user.password
      );
      if (!passwordMatch) {
        return res
          .status(STATUS.NOTFOUND)
          .json({ message: "Invalid Credentials" });
      }
      await prisma.user.update({
        where: { userId: req.user.userId },
        data: { password: await authHelper.hashPassword(newPassword) },
      });

      res.status(STATUS.OK).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }
}

module.exports = new AuthController();
