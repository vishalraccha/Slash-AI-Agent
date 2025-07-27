import {Router} from 'express'
import * as userController from '../controllers/user.controller.js'
import {body} from 'express-validator'
import * as authMiddleware from '../middleware/auth.middleware.js'

const router=Router()

router.post('/register',body('email').isEmail().withMessage('Email must be valid'),
body('password').isLength({min:6}).withMessage('Password must be at least 6 characters'),
userController.createUserController)

router.post('/login',body('email').isEmail().withMessage('Email must be valid'),
body('password').isLength({min:6}).withMessage('Password must be at least 6 characters'),
userController.loginController)

router.get('/chat',authMiddleware.authUser,userController.chatController)

router.post('/test', (req, res) => {
    console.log("Test route hit");
    res.send('Test route is working!');
  });

  router.get('/all', authMiddleware.authUser, userController.getAllUsersController);
export default router