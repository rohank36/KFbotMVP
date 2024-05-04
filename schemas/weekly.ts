import mongoose, { Schema } from "mongoose";

const weeklySchema = new Schema(
    {
        user_id:{type: String, required: true, unique: true},
        chats: {type: [String]},
        user_info: {type: String},
    }
)

const Weekly = mongoose.models.User || mongoose.model("Weekly", weeklySchema);
export default Weekly;