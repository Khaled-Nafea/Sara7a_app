import { UserModel } from "../../DB/Models/users.model.js";
import * as DBservice from "../../DB/DB.repository.js";
import { badRequest, conflict, notFound } from "../../Utils/response/error.response.js";
import successResponse from "../../Utils/response/success.response.js";
import { compareHash, generateHash } from "../../Utils/security/hash.security.js";
import { decrypt, encrypt } from "../../Utils/security/encryption.security.js";
import { generateToken, getNewLoginCredentials } from "../../Utils/token/token.js";
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID } from "../../../config/config.service.js";
import { providerEnum } from "../../Utils/enums/user.enum.js";



export const signup = async (req, res) => {
    const { userName, email, password, phone, gender, role, DOB } = req.body;

    const user = await DBservice.findOne({ model: UserModel, filter: { email } });
    if (user) throw conflict("User already exists");

    const hashedPassword = await generateHash(password);
    const encryptedPhone = encrypt(phone);

    const newUser = await DBservice.create({ 
        model: UserModel, 
        data: { userName, email, password: hashedPassword, phone: encryptedPhone, gender, role, DOB } 
    });

    return successResponse(res, 201, newUser, "User created successfully");
};

export const signin = async (req, res) => {
    const { email, password } = req.body;

    const user = await DBservice.findOne({ model: UserModel, filter: { email } });
    if (!user) throw notFound("Invalid email or password");

    const isMatch = await compareHash(password, user.password);
    if (!isMatch) throw notFound("Invalid email or password");

    if(user.phone){
        user.phone = decrypt(user.phone);
    }

    const tokens = await getNewLoginCredentials(user)

    return successResponse(res, 200, tokens, "User signed in successfully");
};

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

