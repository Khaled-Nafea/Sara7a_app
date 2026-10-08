import { UserModel } from "../../DB/Models/users.model.js";
import * as DBservice from "../../DB/DB.repository.js";
import { conflict, notFound } from "../../Utils/response/error.response.js";
import successResponse from "../../Utils/response/success.response.js";
import { compareHash, generateHash } from "../../Utils/security/hash.security.js";
import { decrypt, encrypt } from "../../Utils/security/encryption.security.js";



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


    return successResponse(res, 200, user, "User signed in successfully");
};
