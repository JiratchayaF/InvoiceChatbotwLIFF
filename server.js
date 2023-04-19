const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { route } = require('express/lib/application');
// const { redirect } = require('express/lib/response');

// connect to DB
const url = 'mongodb+srv://fuengjiratchaya:mongotest123@testmongo.wxnjfzh.mongodb.net/InvoiceData'
const app = express();

// Define server port
const port = process.env.PORT || 80;

app.listen(port, () => console.log( `Server running on port ${port}`))

// view engine setup
app.set('view', express.static(path.join(__dirname, '/view')))
app.set('view engine', 'ejs')
app.use(express.static('public'))


// Routing
// app.use('/user', path.join(__dirname, '/routes/root.js'))

// Middleware layer: parse JSON data
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}))



// create data schema in JSON form
const CustomerDataSchema = {
  orderNumber: String,
  firstname: String,
  lastname: String,
  address: String,
  taxID: String
}
// Create schema model to input
const CustomerData = mongoose.model("Customerdatas", CustomerDataSchema)

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

app.get('/', function(req, res) {

    res.sendFile(path.join(__dirname,'view/index.html'));

});

app.post('/', function(req,res,next){
    let NewCustomerData = new CustomerData({
      orderNumber: req.body.OrderNumber,
      firstname: req.body.first_name,
      lastname: req.body.last_name,
      address: req.body.Address,
      taxID: req.body.ID_Number
    });
    console.log('updated');
    NewCustomerData.save();
    res.redirect(302, "/"); // redirect to main page
    console.log('POST request');
  }); 


// run app on local server
// app.listen(port,'0.0.0.0');
// console.log('Server started at http://localhost:' + port);
