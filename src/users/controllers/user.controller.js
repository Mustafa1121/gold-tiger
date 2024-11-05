const { validationResult } = require("express-validator");
const STATUS = require("../../shared-utils/status-code");
const Prisma = require("../../database/prisma");
const UserMapper = require("../mappers/auth.mapper");
const NotificationMapper = require("../mappers/notification.mapper");
const Email = require("../../shared-utils/email");

// Prisma instance
const { prisma } = new Prisma();

class UserController {
  async getProfile(req, res) {
    try {
      res.status(STATUS.OK).json({
        data: UserMapper.mapToResponse(req.user),
      });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  async deleteUser(req, res) {
    try {
      await prisma.user.delete({
        where: {
          userId: req.user.userId,
        },
      });
      res.status(STATUS.OK).json({
        data: {
          message: "User Deleted Successfully",
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  async updateProfile(req, res) {
    const { fullName, phoneNumber, userRole, fieldOfInterest, email } =
      req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(STATUS.BAD_REQUEST).json({ message: errors.array() });
    }

    try {
      // Create an empty data object and add only fields that exist in req.body
      let dataToUpdate = {};

      if (fullName) {
        dataToUpdate.fullName = fullName;
      }

      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        // If a user with the same email exists and it's not the current user, throw an error
        if (existingUser && existingUser.userId !== req.user.userId) {
          return res
            .status(STATUS.CONFLICT)
            .json({ message: "Email already in use by another user" });
        } else {
          dataToUpdate.email = email;
        }
      }

      if (phoneNumber) {
        dataToUpdate.phoneNumber = phoneNumber;
      }

      if (userRole) {
        dataToUpdate.userRole = {
          connect: {
            roleId: userRole,
          },
        };
      }

      if (fieldOfInterest && Array.isArray(fieldOfInterest)) {
        dataToUpdate.fieldOfInterest = {
          connect: fieldOfInterest.map((fieldId) => ({ fieldId })),
        };
      }

      const updatedUser = await prisma.user.update({
        where: {
          userId: req.user.userId,
        },
        data: dataToUpdate, // Only include fields that exist
      });

      res.status(STATUS.OK).json({
        data: UserMapper.mapToResponse(updatedUser),
      });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  async getUserNotifications(req, res) {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: req.user.userId,
        },
        include: {
          NotificationEvent: true,
          NotificationNews: true,
        },
      });

      res.status(STATUS.OK).json({
        data: NotificationMapper.mapToResponseBulk(notifications),
      });
    } catch (error) {
      console.error(error);
      res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Server error" });
    }
  }

  async modifyAllowedNotification(req, res) {
    try {
      const { allowedNotifications } = req.body;

      if (!allowedNotifications || !Array.isArray(allowedNotifications)) {
        return res
          .status(STATUS.BAD_REQUEST)
          .json({ message: "Invalid input" });
      }

      await prisma.user.update({
        where: { userId: req.user.userId },
        data: { allowedNotifications: allowedNotifications },
      });

      return res.status(STATUS.NO_CONTENT).json({});
    } catch (error) {
      console.error("Error modifying allowed notifications:", error);
      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  }

  async sendContactUs(req, res) {
    const { fullName, email } = req.user;
    const { content } = req.body;
  
    try {
      const emailInstance = new Email(req.user, false);
  
      await emailInstance.sendContactUs(fullName, email, content); 
      res.status(STATUS.OK).json({ message: "Message sent successfully" });
    } catch (error) {
      console.log(error)
      return res
        .status(STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }
  } 
  
}

module.exports = new UserController();
