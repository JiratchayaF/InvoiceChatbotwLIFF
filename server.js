const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { route } = require('express/lib/application');
const MongoClient = require('mongodb').MongoClient
// const { redirect } = require('express/lib/response');

// const orderData = require('./model/database.js')

// connect to DB
// const url = 'mongodb+srv://fuengjiratchaya:mongotest123@testmongo.wxnjfzh.mongodb.net/invoiceData'
const url = 'mongodb+srv://fuengjiratchaya:mongotest123@testmongo.wxnjfzh.mongodb.net/orderTransaction'
const app = express();

// Define server port
const port = process.env.PORT || 3000;

app.listen(port, () => 
  console.log( `Server running on port ${port}`)
)

// view engine setup
app.set('view', express.static(path.join(__dirname, '/view')))
app.set('view engine', 'ejs')
app.use(express.static('public'))


// Routing
// app.use('/user', path.join(__dirname, '/routes/root.js'))

// Middleware layer: parse JSON data
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))


// // Retrieving data from MongoDB
// const Schema  = mongoose.Schema


// const orderData = mongoose.model('orderSchema', orderSchema);

// // // Posting data from invoice request form to MongoDB
// // crceate data schema in JSON form
// const CustomerDataSchema = {
//   firstname: String,
//   lastname: String,
//   address: String,
//   taxID: String
// }
// Create schema model to input
// const CustomerData = mongoose.model("CustomerData", CustomerDataSchema)

const orderSchema = new mongoose.Schema({
  _id: Number,
  customerName: String,
  date: String,
})

const orderData = mongoose.model('orderTransaction', orderSchema)
module.exports = orderData


mongoose.set("strictQuery", false);
// db connection
mongoose.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
  })
    .then(result => {
      console.log("Connected to MongoDB");
      // console.log(result)
      // Perform database operations here
      
    })
    .catch(err => {
      console.log("Failed to connect to MongoDB:", err);
    });


orderData.find()
    .then(data => {
      console.log('Here is the result: ', data)
      
    }).catch(err => {
      console.log(err)
    })

app.get('/', function(req, res) {

    res.sendFile(path.join(__dirname,'view/index.html'));

});

// app.post('/', function(req,res,next){
//     let NewCustomerData = new CustomerData({
//       firstname: req.body.first_name,
//       lastname: req.body.last_name,
//       address: req.body.Address,
//       taxID: req.body.ID_Number
//     });
//     console.log('updated');
//     NewCustomerData.save();
//     res.redirect(302, "/"); // redirect to main page
//     console.log('POST request');
//   }); 


// // Rethrieve transaction data from MongoDB
//  app.get('/orders', (req, res) => {
//   console.log('routing to /orders')
//   orderData.find()
//   .then((client) => {
//     res.send(client);
//     console.log('data found!')
//   }).catch((err) => {
//     console.log(err)
//   }) 
//  })


// run app on local server
// app.listen(port,'0.0.0.0');
// console.log('Server started at http://localhost:' + port);


