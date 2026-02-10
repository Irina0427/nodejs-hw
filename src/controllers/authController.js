import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

import { User } from '../models/user.js';
import { sendMail } from '../utils/sendMail.js';
import { FIFTEEN_MINUTES } from '../constants/time.js';

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: 'Password reset email sent successfully',
      });
    }

const token = jwt.sign(
  { sub: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: FIFTEEN_MINUTES / 1000 }
);

    const templatePath = path.resolve(
      'src/templates/reset-password-email.html'
    );
    const source = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(source);

    const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    const html = template({
      username: user.username,
      resetLink,
    });

    await sendMail({
      to: email,
      subject: 'Reset your password',
      html,
    });

    res.status(200).json({
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
  next(error);
} {
    next(
      createHttpError(
        500,
        'Failed to send the email, please try again later.'
      )
    );
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    });

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
};
