const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class AuthHelper {
  constructor(tokenSecret) {
    this.tokenSecret = tokenSecret;
  }

  generateAccessToken(user) {
    return jwt.sign({ user }, this.tokenSecret, { expiresIn: "1y" });
  }

  async comparePasswords(plainTextPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainTextPassword, hashedPassword);
    } catch (error) {
      console.error(error);
      throw new Error("Password comparison failed");
    }
  }

  generateResetPasswordToken() {
    const resetToken = Math.floor(10000 + Math.random() * 90000).toString();
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return { resetToken, passwordResetToken, passwordResetExpires };
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  normalizeEmail(email) {
    const [localPart, domainPart] = email.split("@");
    const username = localPart.split("+")[0].replace(/\./g, "");
    const domain = domainPart.toLowerCase();
    return `${username}@${domain}`;
  }
}

module.exports = new AuthHelper(process.env.SECRET_KEY);
