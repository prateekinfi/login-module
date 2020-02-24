const express= require("express")
const router =express.Router();
const _ = require("lodash");
const authenticated =require("../middlewares/authentication.js");
const admin =require("../middlewares/authorization-admin.js");
const {User} = require('../models/user');
const bcrypt = require('bcrypt');


//get current user info
router.get("/me", authenticated ,async (req,res,)=>{

    let user= await User.findById(req.user._id).select("-password");
    res.status(200).send(user);
    
});

//get all users
router.get("/users", authenticated , admin ,async (req,res,)=>{

    let user= await User.find().select("-__v").sort("name");
    res.status(200).send(user);

});

//create user
router.post("/user",async (req,res) => { 
   // console.log(req.body);
    let user = await User.findOne({ email: req.body.email });
    if(!user){
        user = await User.findOne({ email: req.body.username });
    }
    if (user) return res.status(400).send("User already exists.");
    
    user =new User(_.pick(req.body,["firstname","lastname","username","email","password","phone"]));
    const salt = await bcrypt.genSalt(10);
    user.password= await bcrypt.hash(user.password, salt);
    let result = user.save();  

    if(result)
    res.status(200).header("x-auth-token",user.generateAuthToken()).send("Token created.");
    else
    res.status(400).send("Something went wrong while creating a user.");
    
});


module.exports = router;