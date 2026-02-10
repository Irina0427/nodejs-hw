import createHttpError from 'http-errors';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { User } from '../models/user.js';

export const updateUserAvatar = async (req, res, next) => {
  if (!req.file) {
    return next(createHttpError(400, 'No file'));
  }

  const result = await saveFileToCloudinary(req.file.buffer);

  await User.findByIdAndUpdate(req.user._id, {
    avatar: result.secure_url,
  });

  res.status(200).json({ url: result.secure_url });
};
