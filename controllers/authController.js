import User from '../model/user.js';
import jwt from 'jsonwebtoken';
import bcrypt  from 'bcryptjs';

export const register = async(req,res)=>{
    try{
        const { email, password } = req.body;
        const hashed = await bcrypt.hash(password,10);
        const user = await User.create({email , password: hashed});
        if(!email || !password){
            return res.json({error: 'Failed to register'});
        }
        const token = jwt.sign({id: user._id},process.env.JWT_SECRET);
        res.json({token});
    }catch (err) {
        return res.status(400).json({error: 'Failed to register'});
    }
};

export const login = async (req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user || !(await bcrypt.compare(password,user.password))){
            return res.status(401).json({error: 'Invalid credentials '});
        }
        const token = jwt.sign({id: user._id},process.env.JWT_SECRET);
        res.json({token});
    }catch {
        res.status(400).json({error: 'Failed to register'});
    }
};


