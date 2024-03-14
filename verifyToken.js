
const jwt = require('jsonwebtoken');

// ************************************* Middleware *************************************
function verifyToken(req,res,next) {
    
    // console.log(req.headers);
    if(req.headers.authorization !== undefined){
        let token = req.headers.authorization.split(" ")[1];

        // console.log(token);
        // res.send("comming from middleware for checking the incomming token")

        jwt.verify(token, "shubh", (e,result)=>{
            if(!e){
                next();
            }
            else{
                res.send({message:"token invalid"})
            }
        })
    }
    else{
        res.send({message:"please send a token , (u r'nt authorized)"})
    }
}


module.exports = verifyToken;