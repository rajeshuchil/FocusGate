import Task from '../model/task.js';

export const getTask = async (req,res) =>{
    try{
        const task =  await Task.find().sort({createdAt:-1});
        res.json(task);
    }catch{
        res.status(401).json({error:'Failed to fetch the task'});
    }
}

export const createTask = async (req, res) =>{
    try{
        const {title,duration,userId} = req.body;
        console.log(req.body);
        const task = await Task.create({
            title,
            duration,
            userId
        });
        res.status(201).json(task);
    }catch{
        res.status(400).json({ error: 'failed to create the task'});    
    }
}

export const taskCompleted = async (req,res) =>{
    try{
        const {id} = req.params;

        const task =  await Task.findByIdAndUpdate(id,{
            Completed:true,
            endsAt:new Date()
        },{new:true});
        res.json(task);
    }catch{
        res.status(401).json({error:'Failed to complete the task'});
    }
}