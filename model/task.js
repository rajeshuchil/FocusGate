import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: String,
    duration: {type: Number, required: true},
    Completed: {type: Boolean, default: false},
    startedAt: {type:Date, default: Date.now},
    endsAt: {type: Date },
    completedAt : {type: Date },
    tokenGenerated: {type: Boolean, default: false},
    userId : {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {timestamps: true});

const Task = mongoose.model('Task',taskSchema);

export default Task;