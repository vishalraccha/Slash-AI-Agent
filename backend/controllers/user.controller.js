import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";

export const createUserController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await userService.createUser(req.body);
    const token = await user.generateJWT();
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


export const loginController=async(req,res)=>{
    const errors=validationResult(req)

    if(!errors.isEmpty()){
       return res.status(400).json({errors:errors.array()})
    }
    try{
        const {email,password}=req.body
        const user=await userModel.findOne({email}).select("+password")

        if(!user){
           return res.status(400).json({message:"User not found"})
        }
        const isMatch=await user.isValidPassword(password)
        if(!isMatch){
          return res.status(400).json({message:"Incorrect password"})
        }

        const token=await user.generateJWT()
        return res.status(200).json({user,token})
    }
    catch(error){
      console.log(error)
        res.status(400).send(error.message)
    }
}

export const chatController=(req,res)=>{
  console.log(req.user)
  res.status(200).json({user:req.user})
}

export const getAllUsersController = async (req, res) => {
  try {

      const loggedInUser = await userModel.findOne({
          email: req.user.email
      })

      const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

      return res.status(200).json({
          users: allUsers
      })

  } catch (err) {

      console.log(err)

      res.status(400).json({ error: err.message })

  }
}