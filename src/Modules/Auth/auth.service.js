import { UserModel } from "../../DB/Models/users.model.js";
import * as DBservice from "../../DB/DB.repository.js";
import { badRequest, conflict, notFound } from "../../Utils/response/error.response.js";
import successResponse from "../../Utils/response/success.response.js";
import { compareHash, generateHash } from "../../Utils/security/hash.security.js";
import { decrypt, encrypt } from "../../Utils/security/encryption.security.js";
import { generateToken, getNewLoginCredentials } from "../../Utils/token/token.js";
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from "../../../config/config.service.js";
import { flagEnum, providerEnum } from "../../Utils/enums/user.enum.js";
import { emailSubject } from "../../Utils/enums/email.enum.js";
import { emailEvent } from "../../Utils/events/email.event.js";
import { generateOTP } from "../../Utils/OTP/gnerateOTP.js";
import { TokenModel } from "../../DB/Models/token.models.js";



export const signup = async (req, res) => {
    const { userName, email, password, phone, gender, role, DOB } = req.body;

    const user = await DBservice.findOne({ model: UserModel, filter: { email } });
    if (user) throw conflict("User already exists");

    const hashedPassword = await generateHash(password);
    const encryptedPhone = encrypt(phone);
    const OTP = generateOTP();
    const hashedOTP = await generateHash(OTP);

    const newUser = await DBservice.create({ 
        model: UserModel, 
        data: { userName, email, password: hashedPassword, phone: encryptedPhone, gender, role, DOB, confirmEmailOTP: hashedOTP } 
    });

    emailEvent.emit("confirmEmail", {
        to: email,
        subject: emailSubject.confirmEmail,
        firstName: userName,
        OTP: OTP,
    });

    return successResponse(res, 201, newUser, "User created successfully");
};

export const signin = async (req, res) => {
    const { email, password } = req.body;
    

    const user = await DBservice.findOneAndUpdate({ 
        model: UserModel, 
        filter: { email, confirmEmail: { $exists: true } },
        update: { $unset: { changeCredentialsTime: true } },
        options: { new: true }
    });
    if (!user) throw notFound("Invalid email or password");

    const isMatch = await compareHash(password, user.password);
    if (!isMatch) throw notFound("Invalid email or password");

    if(user.phone){
        user.phone = decrypt(user.phone);
    }

    const tokens = await getNewLoginCredentials(user)

    return successResponse(res, 200, tokens, "User signed in successfully");
};

export const confirmEmail = async (req, res) => {
    const { email, OTP } = req.body;

    const user = await DBservice.findOne({ model: UserModel, filter: { 
        email, 
        confirmEmail: { $exists: false }, 
        confirmEmailOTP: { $exists: true } 
    } });
    if (!user) throw notFound("Invalid email");

    const isMatch = await compareHash(OTP, user.confirmEmailOTP);
    if (!isMatch) throw notFound("Invalid OTP");

    
    await DBservice.updateOne({ 
        model: UserModel, 
        filter: { email }, 
        update: { confirmEmail: Date.now(), $unset: { confirmEmailOTP: true } } 
    });

    return successResponse(res, 200, "Email confirmed successfully");
}

export const refreshToken = async (req , res) => {
    const token = await getNewLoginCredentials(req.user);

    return successResponse(res, 200, token, "Token refreshed successfully");
}

export const verifyGoogleToken = async (idToken) => {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({idToken, audience:GOOGLE_CLIENT_ID});
  const payload = ticket.getPayload();

  return payload;
}

export const signInWithGoogle = async (req, res) => {
    const {idToken} = req.body;
    
    const {email, picture,given_name, family_name, email_verified} = await verifyGoogleToken(idToken);

    if(!email_verified) throw badRequest("Email not verified");
    
    const user = await DBservice.findOne({ model: UserModel, filter: { email } });
    if (user){
        if(user.provider === providerEnum.GOOGLE){
           const tokens = await getNewLoginCredentials(user);
          successResponse(res, 200, tokens, "User signed in with Google successfully");
        }
    }else{
        const newUser = await DBservice.create({ 
            model: UserModel, 
            data: { 
                firstName: given_name,
                lastName: family_name,
                email,
                profilePicture: picture,
                provider: providerEnum.GOOGLE
            } 
        });
        const tokens = await getNewLoginCredentials(newUser);
        successResponse(res, 201, tokens, "User signed up with Google successfully");
    }
}

export const forgetPassword = async (req, res) => {
    const { email } = req.body;

    const OTP = generateOTP();
    const hashedOTP = await generateHash(OTP);

    const user = await DBservice.findOneAndUpdate({ 
        model: UserModel, 
        filter: { email, provider: providerEnum.SYSTEM, confirmEmail: { $exists: true } }, 
        update: { forgetPasswordOTP: hashedOTP } 
    });
    if (!user) throw notFound("Invalid email");

    emailEvent.emit("forgetPassword", {to: email,  OTP: OTP, firstName: user.firstName});

    return successResponse(res, 200, "OTP sent to your email");
}

export const resetPassword = async (req, res) => {
    const { email, OTP, newPassword: password } = req.body;

   const user = await DBservice.findOne({ 
        model: UserModel, 
        filter: { email, provider: providerEnum.SYSTEM, confirmEmail: { $exists: true }, forgetPasswordOTP: { $exists: true } }, 
    });
    if (!user) throw notFound("Invalid email");

    const isOTPValid = await compareHash(OTP, user.forgetPasswordOTP);
    if (!isOTPValid) throw badRequest("Invalid OTP");

    const hashedPassword = await generateHash(password);

    await DBservice.updateOne({ 
        model: UserModel, 
        filter: { email }, 
        update: { password: hashedPassword, $unset: { forgetPasswordOTP: true } } 
    });

    return successResponse(res, 200, "Password reset successfully");
}

export const logout = async (req, res) => {
    const { flag } = req.query;

    let status = 200;
    switch (flag) {
        case flagEnum.Logout:
            await DBservice.create({
                model: TokenModel,
                data:{
                    jti: req.decoded.jti,
                    userId: req.user._id,
                    expiredIn: new Date(req.decoded.exp * 1000)
                }
            });
            status = 201;
            break;

        case flagEnum.LogoutFromAll:
            await DBservice.updateOne({
                model: UserModel,
                filter: { _id: req.user._id },
                update: { changeCredentialsTime: Date.now() }
            });
            status = 200;
            break;
    
        default:
            throw badRequest("Invalid logout flag");
    }

    return successResponse(res, status, "User logged out successfully");
}