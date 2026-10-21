import successResponse from "../../Utils/response/success.response.js";

export const getProfile = async (req, res) => {
    successResponse(res, 200, req.user, "Profile retrieved successfully");
};

export const uploadProfile = async (req, res) => {
    console.log(req.file);
    successResponse(res, 200, req.file, "Profile uploaded successfully");
};