import jwt from 'jsonwebtoken';
import { JWT_ADMIN_SECRET_ACCESS, JWT_ADMIN_SECRET_REFRESH, 
    JWT_EXPIRES_IN_ACCESS, JWT_EXPIRES_IN_REFRESH,
    JWT_USER_SECRET_ACCESS, JWT_USER_SECRET_REFRESH } from '../../../config/config.service.js';
import { signatureEnum, TokenTypeEnum } from '../enums/user.enum.js';
import { badRequest, notFound } from '../response/error.response.js';
import { findByID,findOne } from '../../DB/DB.repository.js';
import {UserModel} from '../../DB/Models/users.model.js';
import { v4 as uuid } from 'uuid';
import { TokenModel } from '../../DB/Models/token.models.js';

export const generateToken = ({ payload, secretKey, options}) => {
    const token = jwt.sign(payload, secretKey, options);
    return token;
};

export const getSignature = ({ signatureLevel = signatureEnum.USER }) => {
   let signature = { accessSignature: undefined , refreshSignature: undefined };
   switch (signatureLevel) {
    case signatureEnum.USER:
        signature.accessSignature = JWT_USER_SECRET_ACCESS;
        signature.refreshSignature = JWT_USER_SECRET_REFRESH;
        break;
    case signatureEnum.ADMIN:
        signature.accessSignature = JWT_ADMIN_SECRET_ACCESS;
        signature.refreshSignature = JWT_ADMIN_SECRET_REFRESH;
        break;
    default:
        signature.accessSignature = JWT_USER_SECRET_ACCESS;
        signature.refreshSignature = JWT_USER_SECRET_REFRESH;
        break;
   }
   return signature;
};

export const getNewLoginCredentials = async (user) => {
   const signature = await getSignature({signatureLevel: user.role != signatureEnum.USER ? signatureEnum.ADMIN : signatureEnum.USER });

   const jwtid = uuid();

   const accessToken = generateToken({ payload: { id: user._id }, secretKey: signature.accessSignature, 
    options: { expiresIn: JWT_EXPIRES_IN_ACCESS, jwtid } });
    
   const refreshToken = generateToken({ payload: { id: user._id }, secretKey: signature.refreshSignature, 
    options: { expiresIn: JWT_EXPIRES_IN_REFRESH, jwtid } });

   return { accessToken, refreshToken };
};

export const verifyToken = ({ token, secretKey }) => {
    return jwt.verify(token, secretKey);
};

export const decodedToken = async ({authrization , tokenType = TokenTypeEnum.ACCESS})=>{
    const [Bearer ,token] = authrization.split(' ') || [];

    if(!Bearer || !token) throw badRequest(`Invalid token`);

    let signature = await getSignature({signatureLevel: Bearer === 'ADMIN' ? signatureEnum.ADMIN : signatureEnum.USER});

    const decoded = verifyToken({ token, 
        secretKey: tokenType === TokenTypeEnum.ACCESS ? signature.accessSignature : signature.refreshSignature });

    const isRevoked = await findOne({model: TokenModel, filter: { jti: decoded.jti }});
    if(isRevoked) throw badRequest(`Token is revoked please login again`);

    const user = await findByID({model: UserModel, id: decoded.id});
    if(!user) throw notFound(`Not Registered User`);

    if(user.changeCredentialsTime || 0 > decoded.iat * 1000) throw badRequest(`Token is expired please login again`);

    return {user,decoded};
}