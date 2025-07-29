import Task from '../model/task.js';
import Token from '../model/token.js';

export const checkAndGenerateTokens = async (req,res)=>{
    try{
        const now = new Date();
        const userId = req.user.id;

        const tasks = await Task.find({
            userId,
            endsAt:{$lte:now},
            tokenGenerated:false,
            Completed:false
        });

        const tokens = [];

        for(const task of tasks){
            const token = await Token.create({
                userId,
                taskId: task._id,
                url: ' ',
                used: false,
                expiresAt: new Date(Date.now()+10*60000)
            });
            task.tokenGenerated = true;
            task.Completed= true;
            task.completedAt= now;
            await task.save();

            tokens.push(token);
        }
        res.status(200).json(tokens);
    }catch(err){
        console.error('error in checkAndGennerateTokens:',err);
        res.status(500).json({error: 'internal server error'});
    }
};
