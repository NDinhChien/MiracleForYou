import express from 'express';
import login from './access/login';
import logout from './access/logout';
import signup from './access/signup';
import email from './email/index';
import password from './password/index';
import token from './token/index';
import profile from './profile/index';
import users from './users/index';
import message from './message/index';

const router = express.Router();

router.use('/logout', logout);
router.use('/login', login);
router.use('/email', email);
router.use('/signup', signup);
router.use('/password', password);
router.use('/profile', profile);
router.use('/token', token);
router.use('/users', users);
router.use('/message', message);

export default router;
