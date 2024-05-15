import express from 'express';
import userController from '../controller/user-controller.js';
import { authentication } from '../middleware/auth-middleware.js';

const router = express.Router();


// Auth
router.post('/api-public/register', userController.register);
router.post('/api-public/login', userController.login);
router.post('/api-public/forgot-password', userController.forgotPassword);
router.get('/api-public/valid-token/:token', userController.validToken);
router.post('/api/logout', authentication, userController.logout);
router.patch('/api-public/reset-password/:token', userController.resetPassword);



export default router;