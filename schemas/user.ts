import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        telegramId:{type: Number, required: true, unique: true},
        userInfo: {type: String, required: true},
    }
)

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;