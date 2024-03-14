
// created a npm start cmd in package.json file



const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// creating our own module , jst for the understanding purpose
const demo = require("./demo")
// console.log(demo);
// console.log(demo.a.name);
// console.log(demo.b);
// console.log(demo.doSomething());
// demo.doSomething()


// database connection
mongoose.connect("mongodb://localhost:27017/Project_FOOD_API")
.then(()=>{
    console.log("database connection successfull");
})
.catch(e =>{console.log(e)})



// ******************************* importing database schema and the model *******************************
const userModel = require('./Model/userModel')
const foodModel = require('./Model/foodModel')
const trackingModel = require('./Model/trackingModel')
const verifyToken = require('./verifyToken') // this is a middleware 


// creating a express object
const app = express();
app.use(express.json());



// ************************************* end point for registration **************************************
// app.post("/register", express.json() ,(req,res)=>{
app.post("/register", (req,res)=>{
    let user = req.body;
    
    // bcrypt.genSalt(10, (err, salt)=>{
    //     if(!err){
    //         bcrypt.hash(user.password, salt, (err, hpass)=>{
    //             if(!err){
    //                 user.password = hpass;

    //                 userModel.create(user)
    //                 .then((doc) =>{
    //                     res.status(201).send({message:"user registration succesfull"})
    //                 })
    //                 .catch(e =>{
    //                     console.log(e);
    //                     res.status(500).send({message:"some problem, server issue "})
    //                 })
    //             }
    //         })
    //     }
    // })

    console.log(user);

    bcrypt.genSalt(10, (err, salt)=>{ // using async await
        if(!err){
            bcrypt.hash(user.password, salt, async (err, hpass)=>{
                if(!err){

                    user.password = hpass;
                    try{
                        let doc = await userModel.create(user);
                        res.status(201).send({message:"registrain done successfully"})
                    } 
                    catch(err){
                        console.log(err);
                        res.status(500).send({message:"some problem, server issue "})
                    }
                }
            })
        }
    })

})



// ************************************* endpoint for login *************************************
// here we will create a token
app.post("/login", async (req,res)=>{

    let userCred = req.body;

    try {

        // finding a user from database
        let user = await userModel.findOne({email : userCred.email});

        if(user !== null){ // if the user is not there with the email this findone will return null to us

            bcrypt.compare(userCred.password, user.password, (e, result)=>{
                if(result === true){

                    // payload(some data related to user) - {email: userCred.email}
                    // key -> "shubh"
                    // callback function
                    jwt.sign({email: userCred.email}, "shubh", (e, token)=>{
                        if(!e){
                            res.send({message:"login successfull", token : token});
                        }
                        else{
                            res.status(500).send({message:"some issue while creating a token"});
                        }
                    })
                }
                else{
                    res.status(403).send({message:"incorrect pwd"});
                }
            })
        }
        else{
            res.status(404).send({message:"user not found"})
        }
    } 
    catch (e) {
        console.log(e);
        res.status(500).send({message:"some error"})
    }
})



// ************************************* endpoint to fetch all food *************************************
// token is imported thru verify token
app.get("/foods", verifyToken ,async (req,res)=>{
    
    try {
        let foods = await foodModel.find();

        res.status(201).send(foods)
    } 
    catch (e) {
        console.log(e);
        res.status(500).send({message:"some error"})
    }

})



// ************************************* endpoint to search food by name  *************************************
app.get("/foods/:name", verifyToken , async (req,res)=>{

    try {
        // let food = await foodModel.findOne({name : req.params.name});

        // if some one passes the half name instead of full name (example panner ) -> it will bring all the dishes realted to paneer , $option :'i' & i is for case insentivity , true means ingore case senstivity even if you make a spelling mistak , 
        
        //  http://localhost:8000/foods/Paneer
        let food = await foodModel.find({name : {$regex : req.params.name, $options :'i'}});
        // if(food === null){ // food is not available
        if(food.length != 0){ // food is  available
            res.status(201).send(food);
        }
        else{
            res.status(404).send({message:"food item is not available"});
        }
    } 
    catch (e) {
        console.log(e);
        res.status(500).send({message:"some error in getting the food"});
    }

})



// ************************************* endpoint to track food for me  *************************************
app.post("/track", verifyToken ,async (req,res)=>{

    /* 

        s befor tracking req make sure u have created the token , so u have register and the u have logged in so token is generated and send that token here as authoriazation header 
            ex (Authorization -> Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFyanVuQGdtYWlsLmNvbSIsImlhdCI6MTcwODU5MzA3MX0.7Q0lDSZ3rwGMt6YZ0C_VBhKDfUXxlqgB3uzyaBlpsSE)

        method -> post 
        sending data for track req 
        {
            // this user id is of the person who is logged in 
            // also we send the token only of the person who is loged in 
            "userID" : "65d5f9336cf4b74532b98970"
            "foodID" : "65d603d160423083c6cca90b"
            "quantity" : 200

            // whatever the food you are adding to track add that foods id
            in testing client
        }
    
    */

    let trackData = req.body
    // console.log(trackData);

    try{
        let data = await trackingModel.create(trackData);
        // console.log(data);
        res.status(201).send({message:"food added"});
    
    }
    catch(e){
        console.log(e);
        res.status(500).send({message:"some problem in adding the food"})
    }

})



// ****************************** endpoint to fetch all food eaten by a person for whole life *******************************
app.get("/track/:userid", verifyToken, async (req,res)=>{


    let userid = req.params.userid;

    try{
        // let foods = await trackingModel.find({userId: userid})

        // this populate give the acual user which related to this id 
        let foods = await trackingModel.find({userId: userid}).populate('userId').populate('foodId')
        res.status(201).send(foods)
    }
    catch(e){
        console.log(e);
        res.status(500).send({message:"some problem in getting the food"})
    }

})




// *************************** endpoint to fetch all food eaten by a person on particular date ******************************
app.get("/track/:userid/:date", verifyToken, async (req,res)=>{


    let userid = req.params.userid;
    let date = new Date(req.params.date);
    // most imp -> month when we extract it comes 0 - 11 , thats why we add +1 in it;
    let strdate = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();

    console.log(date); 
    console.log(strdate);

    // url link -> http://localhost:8000/track/65d5f9336cf4b74532b98970/02-21-2024
    // do send the token header also 

    try{
        let foods = await trackingModel.find({userId: userid , eatenDate : strdate}).populate('userId').populate('foodId')
        res.status(201).send(foods)
    }
    catch(e){
        console.log(e);
        res.status(500).send({message:"some problem in getting the food"})
    }

})


// ************************************* Middleware *************************************
// function verifyToken(req,res,next) {
    
//     // console.log(req.headers);
//     if(req.headers.authorization !== undefined){
//         let token = req.headers.authorization.split(" ")[1];

//         // console.log(token);
//         // res.send("comming from middleware for checking the incomming token")

//         jwt.verify(token, "shubh", (e,result)=>{
//             if(!e){
//                 next();
//             }
//             else{
//                 res.send({message:"token is not valid , (u r'nt authorized)"})
//             }
//         })
//     }
//     else{
//         res.send({message:"please send a token , (u r'nt authorized)"})
//     }
// }
app.listen(8000, ()=>{
    console.log("server is up and running");
})
