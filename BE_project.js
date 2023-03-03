const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { redirect } = require('express/lib/response');
// connect to DB
const url = 'mongodb+srv://fuengjiratchaya:mongotest123@testmongo.wxnjfzh.mongodb.net/InvoiceData'
const app = express();

// รอcomment
// const port = process.env.PORT || 8080;

app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))

// create data schema in JSON form
const CustomerDataSchema = {
  firstname: String,
  lastname: String,
  address: String,
  taxID: String
}
// Create schema model to input
const CustomerData = mongoose.model("CustomerData", CustomerDataSchema)

mongoose.set("strictQuery", false);
// db connection
mongoose.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
  })
    .then(client => {
      console.log("Connected to MongoDB");
      // Perform database operations here
    })
    .catch(err => {
      console.log("Failed to connect to MongoDB:", err);
    });

app.get('/', function(req, res, next) {

    res.sendFile(path.join(__dirname,'LIFF/index.html'));

});

app.post('/InvoiceChatbotwLIFF/LIFF/', function(req,res){
    let NewCustomerData = new CustomerData({
      firstname: req.body.first_name,
      lastname: req.body.last_name,
      address: req.body.Address,
      taxID: req.body.ID_Number
    });
    NewCustomerData.save();
    res.redirect("/InvoiceChatbotwLIFF/LIFF/") // redirect to main page
}); 


// รอcomment
// app.listen(port);
// console.log('Server started at http://localhost:' + port);
//