const nodemailer = require('nodemailer');

class Email {
  constructor(user, isInternal = true) {
    this.user = user;
    this.isInternal = isInternal; // Flag to determine if it's internal or external
    this.from = isInternal ? `<${process.env.EMAIL_USERNAME}>` : user.email; // Set 'from' based on flag
    this.to = isInternal ? user.email : `<${process.env.EMAIL_USERNAME}>`; // Flip 'to' and 'from' for external emails
  }

  newTransport() {
    return nodemailer.createTransport({
      service: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject, attachments = []) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: template,
      attachments: attachments,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendPasswordReset(content) {
    await this.send(
      content,
      'Your password reset token (valid for only 10 minutes)',
    );
  }

  async sendContactUs(fullName, email, content) {
    const subject = `${fullName} - New Contact Us Message`;
    const body = `From: ${email}\n\nMessage:\n${content}`;
    
    await this.send(
      body,
      subject
    );
  }
}

module.exports = Email;
