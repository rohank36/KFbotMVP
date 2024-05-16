import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        telegramId:{type: String, required: true, unique: true},
        type: {type: String, required: true},
        msg: {type: String, required: true},
        res: {type: String, required: true},
    }
)

const Message = mongoose.models.User || mongoose.model("Message", messageSchema);
export default Message;