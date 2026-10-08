import {Router} from "express";
import * as authServices from './auth.service.js';

const router = Router();

router.post('/signup', authServices.signup);
router.post('/signin', authServices.signin);

export default router;
