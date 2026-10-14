import {Router} from "express";
import * as userService from "./user.service.js";
import { authentication,authorization } from "../../Middlewares/auth.middleware.js";
import { TokenTypeEnum, roleEnum } from "../../Utils/enums/user.enum.js";

const router = Router();


router.get("/profile", authentication({tokenType: TokenTypeEnum.ACCESS}), authorization({accessRoles:[roleEnum.ADMIN]}),
 userService.getProfile);

export default router;