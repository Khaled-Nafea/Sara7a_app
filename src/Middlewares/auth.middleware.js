import { TokenTypeEnum } from "../Utils/enums/user.enum.js";
import { forbidden } from "../Utils/response/error.response.js";
import { decodedToken } from "../Utils/token/token.js";

export const authentication = ({tokenType = TokenTypeEnum.ACCESS}) => {
    return async (req, res, next) => {
        const {user,decoded} = await decodedToken({authrization: req.headers.authorization, tokenType});
        req.user = user;
        req.decoded = decoded;

        return next();
    }
}

export const authorization = ({accessRoles = ["ADMIN","USER","SUPERADMIN"]}) => {
    return (req, res, next) => {
        if (!accessRoles.includes(req.user.role)) {
            throw forbidden("You are not authorized to perform this action");
        }
        return next();
    }
}