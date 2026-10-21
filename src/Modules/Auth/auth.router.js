import {Router} from "express";
import * as authServices from './auth.service.js';
import { authentication, authorization } from "../../Middlewares/auth.middleware.js";
import { roleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";

const router = Router();

router.post('/signup', authServices.signup);
router.post('/signin', authServices.signin);
router.patch('/confirm-email', authServices.confirmEmail);
router.patch('/forget-password', authServices.forgetPassword);
router.patch('/reset-password', authServices.resetPassword);

router.post('/refresh-token',authentication({tokenType: TokenTypeEnum.REFRESH}),
authorization({accessRoles: [roleEnum.USER, roleEnum.ADMIN]}), authServices.refreshToken);

router.post('/google', authServices.signInWithGoogle);

router.post('/logout', authentication({tokenType: TokenTypeEnum.ACCESS}),
authorization({accessRoles: [roleEnum.USER, roleEnum.ADMIN]}), authServices.logout);

export default router;
