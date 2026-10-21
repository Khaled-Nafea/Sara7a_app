import { Schema, model } from "mongoose";
import { genderEnum, providerEnum, roleEnum } from "../../Utils/enums/user.enum.js";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            minlength: [3, "First name must be at least 3 characters"],
            maxlength: [25, "First name must be at most 25 characters"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            minlength: [3, "Last name must be at least 3 characters"],
            maxlength: [25, "Last name must be at most 25 characters"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: function () {
                return this.provider === providerEnum.SYSTEM;
            },
            trim: true,
        },
        gender: {
            type: Number,
            enum: Object.values(genderEnum),
            default: genderEnum.MALE,
        },
        role: {
            type: Number,
            enum: Object.values(roleEnum),
            default: roleEnum.USER,
        },
        provider: {
            type: Number,
            enum: Object.values(providerEnum),
            default: providerEnum.SYSTEM,
        },
        phone: String,
        age: Number,
        DOB: Date,
        confirmEmail: Date,
        confirmEmailOTP: String,
        changeCredentialsTime: Date,
        forgetPasswordOTP: String,
        profilePicture: String,
        coverImages: [String],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
}).get(function () {
    return `${this.firstName} ${this.lastName}`;
});

export const UserModel = model("User", userSchema);
