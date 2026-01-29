import { Router } from 'express';

import { registerUserSchema, loginUserSchema } from '../validations/authValidation.js';
import { registerUser, loginUser, refreshUserSession, logoutUser } from '../controllers/authController.js';

const router = Router();

router.post('/auth/register', registerUserSchema, registerUser);
router.post('/auth/login', loginUserSchema, loginUser);
router.post('/auth/refresh', refreshUserSession);
router.post('/auth/logout', logoutUser);

export default router;
