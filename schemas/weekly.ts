import mongoose, { Schema } from "mongoose";

const weeklySchema = new Schema(
    {
        telegramId:{type: Number, required: true},
        chats: {type: [String], default: []},
        user_info: {type: String},
        //weeklyGoal: {type: String},
        //summary: {type: String},
        done: {type: Boolean, default: false},
    },
    {timestamps: true }
)

const Weekly = mongoose.models.User || mongoose.model("Weekly", weeklySchema);
export default Weekly;