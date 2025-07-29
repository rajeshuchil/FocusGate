import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    taskId: {type:mongoose.Schema.Types.ObjectId, ref: 'Task'},
    url: {type: String},
    used: {type: Boolean, default: false},
    expiresAt: {type: Date}
}, {timestamps: true});

const Token = mongoose.model('Token', tokenSchema);

export default Token;
