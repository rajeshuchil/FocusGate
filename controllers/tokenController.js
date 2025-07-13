import Token from '../model/token.js';

export const getTokens = async(req,res) =>{
    try{
        const token = await Token.find({used:false});
        res.json(token);
    }catch(error){
        res.status(500).json({error: 'Failed to get the token'});
    }
}

export const issueToken = async (req,res)=>{
    try{
        const {site,userId} = req.body;
        const issuedAt = new Date();
        const token = await Token.create({
            site,
            userId,
            issuedAt
        });
        res.json(token);
    }catch(error){
        res.status(400).json({error: "failed to issye the token"});
    }
}

export const useToken = async (req,res)=>{
    try{
        const {id}= req.params;
        const usedAt = new Date();
        const expiresAt = new Date(usedAt.getTime()+10*60*1000);

        const token = await Token.findByIdAndUpdate(id,{
            used:true,
            usedAt,
            expiresAt
        },{new:true});
        res.json(token);
    }catch(error){
        res.status(400).json({error: 'Failed to use the token'});
    }
};
