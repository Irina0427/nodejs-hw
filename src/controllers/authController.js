import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'node:fs/promises';
import path from 'node:path';
import handlebars from 'handlebars';
import createHttpError from 'http-errors';

import { User } from '../models/user.js';
import { sendEmail } from '../utils/sendMail.js';


export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createHttpError(409, 'Email in use'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
 
    });

    return res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(createHttpError(401, 'Email or password is wrong'));
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return next(createHttpError(401, 'Email or password is wrong'));
    }

    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {

    return res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};



const templatePath = path.resolve('src', 'templates', 'reset-password-email.html');

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    
    if (!user) {
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    }

    const token = jwt.sign(
      { sub: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    const link = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    const source = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(source);

    const html = template({
      name: user.username ?? user.email,
      link,
    });

    try {
      await sendEmail({
        from: process.env.SMTP_FROM, 
        to: user.email,
        subject: 'Password reset',
        html,
      });
    } catch {
 
      return next(createHttpError(500, 'Failed to send the email, please try again later.'));
    }

    return res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch{
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    const user = await User.findOne({ _id: payload.sub, email: payload.email });
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
