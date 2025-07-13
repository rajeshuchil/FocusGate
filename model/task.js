import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title:String,
    Completed:{type:Boolean , default: false},
    startedAt: { type:Date , default: Date.now()},
    duration:{type: Number,required:true},
    endsAt:{type:Date},
    CreatedAt:{type:Date,default:Date.now()},
});

const Task = mongoose.model('Task',taskSchema);

export default Task;
