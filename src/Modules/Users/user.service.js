import { findByIDAndUpdate } from "../../DB/DB.repository.js";
import { UserModel } from "../../DB/Models/users.model.js";
import successResponse from "../../Utils/response/success.response.js";

export const getProfile = async (req, res) => {
    successResponse(res, 200, req.user, "Profile retrieved successfully");
};

export const uploadProfile = async (req, res) => {
    const user = await findByIDAndUpdate({ model: UserModel, id: req.user._id, 
        update: { profilePicture: req.file.finalPath } });
    successResponse(res, 200, user, "Profile uploaded successfully");
};

export const uploadMultiplePictures = async (req, res) => {
    const user = await findByIDAndUpdate({ model: UserModel, id: req.user._id, 
        update: { coverImages: req.files?.map(file => file.finalPath) || [] } });
    successResponse(res, 200, user, "Pictures uploaded successfully");
};