const { Schema, Types, model } = require("mongoose");

const economySchema = new Schema({
    userID: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: null 
    },
    wallet: {
         type: Number, 
         default: 0 
        },
    bank: { 
        type: Number, 
        default: 0 
    },
    bankSpace: { 
        type: Number, 
        default: 10000 
    },
});

const Economy = model("economy-users", economySchema);


module.exports = Economy;