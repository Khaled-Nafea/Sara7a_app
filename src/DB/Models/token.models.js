import { Schema, model } from "mongoose";

const tokenSchema = new Schema(
    {
        jti: {
            type: String,
            required: [true, "JWT ID is required"],
            unique: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
        },
        expiredIn: {
            type: Date,
            required: [true, "Expiration date is required"],
        },
    },
    {
        timestamps: true,
    },
);

tokenSchema.index("expiredIn", { expireAfterSeconds: 0 });

export const TokenModel = model("Token", tokenSchema);
