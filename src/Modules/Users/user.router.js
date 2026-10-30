import {Router} from "express";
import * as userService from "./user.service.js";
import { authentication,authorization } from "../../Middlewares/auth.middleware.js";
import { TokenTypeEnum, roleEnum } from "../../Utils/enums/user.enum.js";
import { allowedMimeTypes, localFileUpload, validationMagicNumbers } from "../../Utils/multer/local.multer.js";

const router = Router();


router.get("/profile", authentication({tokenType: TokenTypeEnum.ACCESS}), authorization({accessRoles:[roleEnum.ADMIN]}),
 userService.getProfile);

router.patch("/upload-profile", authentication({tokenType: TokenTypeEnum.ACCESS}), 
localFileUpload({custmoPath: "users", validTypes: [...allowedMimeTypes.image, ...allowedMimeTypes.document]}).single("attachment"),
 validationMagicNumbers(allowedMimeTypes.document), userService.uploadProfile);

router.patch("/upload-multiple-pictures", authentication({tokenType: TokenTypeEnum.ACCESS}),
 localFileUpload({custmoPath: "users", validTypes: [...allowedMimeTypes.image, ...allowedMimeTypes.document]}).array("attachment", 10),
 validationMagicNumbers(allowedMimeTypes.document), userService.uploadMultiplePictures);

 

export default router;