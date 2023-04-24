const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { route } = require('express/lib/application');

// connect to DB
const url = 'mongodb+srv://fuengjiratchaya:mongotest123@testmongo.wxnjfzh.mongodb.net/InvoiceData'
const app = express();

// Define server port
const port = process.env.PORT || 80;

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
// Create schema model to input to db
const CustomerData = mongoose.model("Customerdatas", CustomerDataSchema)

mongoose.set("strictQuery", false);
// db connection
mongoose.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
  })
    .then(result => {
      console.log("Connected to MongoDB");
      
    })
    .catch(err => {
      console.log("Failed to connect to MongoDB:", err);
    });

app.get('/', function(req, res) {

    res.sendFile(path.join(__dirname,'view/index.html'));

});
// define order number variable in global
let orderNumber;
app.post('/', (req,res) => {
  //post customers data in to mongodb by request the OrderNumber of submited form
    orderNumber = req.body.OrderNumber;
    let NewCustomerData = new CustomerData({
      orderNumber: req.body.OrderNumber,
      firstname: req.body.first_name,
      lastname: req.body.last_name, 
      address: req.body.Address,
      taxID: req.body.ID_Number
    });
    // collection customerdatas model
    const CustomerDatas = mongoose.model('customerdatas', {
      _id: Number,
      orderNumber:String,
      firstname: String,
      lastname: String,
      address: String,
      taxID: String
    });
    // collection transactions model
    const Transactions = mongoose.model('transactions', {
      _id: Number,
      No: Number,
      orderNumber: String,
      shipFee: String,
      productPrice: String,
      productNumber: String,
      productName: String,
      productQuantity: Number,
      discountBill: String,
      linePoints: String,
      discount: String,
      lspDiscount: String,
      totalPrice: String,
      grandTotalPrice: String
  });
  // find the specific order number from Ordernumber by user given
  CustomerDatas.find({orderNumber: orderNumber}, (err, customerDatas) => {
      if (err) throw err;
  // find the specific order number from Transactions by user given
  Transactions.find({orderNumber: orderNumber}, (err, transactions) => {
      if (err) throw err;
  // Merge the results and change data to JSON as "dataResult"
  const dataMerged = [...customerDatas, ...transactions];
  const dataResult = JSON.stringify(dataMerged)
  console.log("Data of order number: " + orderNumber);
  console.log(dataResult); 
      });
    });
    NewCustomerData.save();
    // redirect to main page
    res.redirect(302, "/"); 
  }); 

// module.exports = {dataResult};

// run app on local server
app.listen(port,'0.0.0.0');
// console.log('Server started at http://localhost:' + port);


