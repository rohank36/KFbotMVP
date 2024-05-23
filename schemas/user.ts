import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        telegramId:{type: Number, required: true, unique: true},
        user_info: {type: String, required: true},
    }
)

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;