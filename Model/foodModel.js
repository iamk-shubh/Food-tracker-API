const mongoose = require("mongoose");

// even tho we have our data present in mongo db , we still need a schema to work with the mongoose
const foodSchema = mongoose.Schema({

    name:{ 
        type: String, 
        required: true 
    },
    calories:{ 
        type: Number, 
        required: true 
    },
    protein:{ 
        type: Number, 
        required: true 
    },
    carbohydrates:{ 
        type: Number, 
        required: true 
    },
    fat:{
        type: Number, 
        required: true 
    },
    fiber:{ 
        type: Number, 
        required: true 
    }

}, {timestamps:true});

const foodModel = mongoose.model("foods", foodSchema);
module.exports = foodModel;
