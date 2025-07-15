const crypto = require('crypto');
const EmailToken = require('../models/EmailTokens');
const mailer = require('../config/mailer');
const { EMAIL, APP_BASE_URL } = require('../config/Constants');

async function sendVerificationCode(user) {
  const token = crypto.randomBytes(32).toString('hex');

  await EmailToken.create({ userId: user._id, token });

  const verifyUrl = `${APP_BASE_URL}/verify-email?token=${token}`;
  const bodyText = EMAIL.makeVerificationBody(user, verifyUrl);

  await mailer.send({
    to: user.email,
    subject: EMAIL.VERIFICATION_SUBJECT,
    text: bodyText,
  });
}

module.exports = { sendVerificationCode };
