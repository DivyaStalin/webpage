const UserSchema = require("../model/usermodel");
const { Router } = require('express');
const bcrypt = require('bcrypt');
const route = require('express').Router();

route.post("/register",async (req,res)=>{
    
     let userName = req.body.userName;
     let email = req.body.email;
     let password = req.body.password;
     let role = req.body.role;
    const user =  UserSchema(req.body);
    const salt = await bcrypt.genSalt(10);
    user.password = bcrypt.hashSync(password,salt);
    
    const result = await user.save();
    if(result != "" ){
    return res.status(200)
    .json({status:true,message:'success',result:result});}
    else {
        return res.status(400).json({status: false,message:"failed",});
    }
});
route.get('/getall',async(req,res)=>{
    const alluser = await UserSchema.find().exec();

    if(alluser){
        res.status(200)
        .json({status:true,message:'success',result:alluser});   
    }
    else{
        res.status(400)
        .json({status:false,message:'failed'});
    }
});
route.get("/getone",async(req,res) => {
    let user = req.body.userName;
    const alluser = await UserSchema.findOne({userName:user}).exec();
    console.log("user det",alluser);
    if(alluser){
        res.status(200)
        .json({status:true,message:'success',result:alluser});   
    }
    else{
        res.status(400)
        .json({status:false,message:'failed'});
    }
});
route.put("/updateuser",async (req, res) => {
let user = req.body.userName;
let mail = req.body.email;
const User = await UserSchema.findOne({ userName:user}).exec();
if (User){
    const updateMail = await UserSchema.findOneAndUpdate({email:mail}).exec();
    res.status(200)
    .json({
        status:true,
        message:"successfully updated",
        result: updateMail,
    });
}
else{
    res.status(400).json({
        status:false,
        message:"no user found"
    });
}
});
route.delete("/delete",async (req,res)=>{
    let mail = req.body.email;
    console.log("mail",mail);
    const User = await UserSchema.findOne({email:mail}).exec();
    console.log("user",User);
    if(User){
        const deleteuser = await UserSchema.deleteOne({email:mail}).exec();

        res.status(200).json({
            status:true,
            message:"deleted successfully",
        });
    }else{
        res.status(400)
        .json({status:false,
        message:"No user found",
    });
    }
});
route.post('/login',async(req,res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let userdetails;
    const user = await UserSchema.findOne({email:email}).select("-email-_id").exec();
    if(email){
         userdetails = await UserSchema.findOne({email:email}).exec();
      if(userdetails){
            let match = await bcrypt.compare(password,userdetails.password);
            if(match){
                 await UserSchema
                .findOneAndUpdate({email:email},{loginstatus:true},{new:true})
                .exec();
                res
                .status(200)
                .json({status:true,message:'login success',result:user});
            }
            else{
                res.status(400).json({status:false,message:'password doesnot match',result:user});
            }
        }else{
            res.status(200).json({status:true,message:'user not found'});
        }
    }else{
        res.status(400).json({status:false,message:'enter email id'});

    }
});
route.post('/logout',async(req,res)=>{
    try{
        let id = req.body.id;
        const userdetails = await UserSchema.findOne({_id:id}).exec();
        if(userdetails){
            await UserSchema.findOneAndUpdate(
                {_id:_id},
                {loginstatus:false},
                {new:true}).exec();
            
        res
        .status(404)
        .json({status:false,message:'logout successfully'});
            }

    }
    catch(err){
        res
        .status(400)
        .json({status:false,message:err.message});
    }

})
module.exports = route;