import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

import {
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';

const router = Router();

router.post(
  '/auth/request-reset-email',
  celebrate({ [Segments.BODY]: requestResetEmailSchema }),
  requestResetEmail
);

router.post(
  '/auth/reset-password',
  celebrate({ [Segments.BODY]: resetPasswordSchema }),
  resetPassword
);

export default router;
