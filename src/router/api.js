import express from 'express';
import userController from '../controller/user-controller.js';
import { authentication } from '../middleware/auth-middleware.js';
import cartController from '../controller/cart-controller.js';

const router = express.Router();


// Auth
router.post('/api-public/register', userController.register);
router.get('/api-public/set-activate/:email/:userId', userController.setActivateUser);
router.post('/api-public/login', userController.login);
router.post('/api-public/forgot-password', userController.forgotPassword);
router.get('/api-public/valid-token/:token', userController.validToken);
router.post('/api/logout', authentication, userController.logout);
router.patch('/api-public/reset-password/:token', userController.resetPassword);

router.get('/api/carts', authentication, cartController.getCarts);
router.post('/api/carts', authentication, cartController.createCart);
router.put('/api/carts/:cartId', authentication, cartController.updateCart);
router.delete('/api/carts/:cartId', authentication, cartController.deleteCart);


router.use((req, res, next) => {
    res.status(404).json({ errors: "Periksa lagi Endpoint nya mang salahan kayanya" })
})

export default router;