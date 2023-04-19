// model.js is used for gathering all the data operation from MongoDB 

const mongoose = require('mongoose');

// Define mongoose schema syntax
// const Mongoose = new mongoose.Schema

// Order transaction schema
const orderSchema = new mongoose.Schema({
    _id: Number,
    customerName: String,
    date: String,
})

const orderData = mongoose.model('orderTransaction', orderSchema)
module.exports = orderData

