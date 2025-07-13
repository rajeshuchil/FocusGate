import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    issuedAt:{type:Date, default: Date.now },
    used:{type:Boolean,default:false},
    usedAt:{type:Date },
    expiresAt: {type: Date},
    site: { type:String, required:true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

const Token =mongoose.model('token',tokenSchema);

export default Token;