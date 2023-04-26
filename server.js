const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
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
let dataMerged = {}
app.post('/submit', (req,res) => {
  //post customers data in to mongodb by request the OrderNumber of submited form
    orderNumber = req.body.OrderNumber;
    let NewCustomerData = new CustomerData({
      orderNumber: req.body.OrderNumber,
      firstname: req.body.first_name,
      lastname: req.body.last_name, 
      address: req.body.Address,
      taxID: req.body.ID_Number
    });

    // Define collection customerdatas model
    const CustomerDatas = mongoose.model('customerdatas', {
      _id: Number,
      orderNumber:String,
      firstname: String,
      lastname: String,
      address: String,
      taxID: String
    });

    // Define collection transactions model
    const Transactions = mongoose.model('transactions', {
      _id: Number,
      No: Number,
      orderNumber: String,
      shipFee: Number,
      productPrice: Number,
      productNumber: String,
      productName: String,
      productQuantity: Number,
      discountBill: String,
      linePoints: Number,
      discount: Number,
      lspDiscount: Number,
      totalPrice: Number,
      grandTotalPrice: Number
    });


    // find the specific order number from Ordernumber by user given
    CustomerDatas.find({orderNumber: orderNumber}, (err, customerDatas) => {
      if (err) throw err;
      // find the specific order number from Transactions by user given
      Transactions.find({orderNumber: orderNumber}, (err, transactions) => {
        if (err) throw err;
        // Merge the results and change data to JSON as "dataResult"
        dataMerged = [...customerDatas, ...transactions];


        // At dataMerged[0] is customerData obj
       const customerData = {
        orderNumber: dataMerged[0].orderNumber,
        firstName: dataMerged[0].firstname,
        lastName: dataMerged[0].lastname,
        address: dataMerged[0].address,
        taxID: dataMerged[0].taxID
        }
        // console.log('Array of customerData',customerData)

      let orderData = []
      let orderArray = []
       // While from dataMerged[1] to dataMerged[i] are orderData obj
       for (let i = 1; i < dataMerged.length; i++) {
        orderArray = dataMerged[i]
        orderData.push({
          name: orderArray.productName,
          price: orderArray.productPrice,
          quantity: orderArray.productQuantity,
          shipFee: orderArray.shipFee,
          discount: orderArray.discount,
          linePoints: orderArray.linePoints,
          lspDiscount: orderArray.lspDiscount,
          total: orderArray.productPrice*orderArray.productQuantity        
      })
    }
      
      let subTotal = 0
      let shipFee = 0
      let vat = 0
      let grandTotal = 0
      let totalBeforeTax = 0
      let discount = 0
      let linePoints = 0
      let lspDiscount = 0
      let sumDiscount = 0

      for (let j = 0; j < orderData.length; j++){
        subTotal += orderData[j].total
        shipFee += orderData[j].shipFee
      }
  

    sumDiscount = discount+linePoints+lspDiscount
    console.log('total discount: ', sumDiscount)
    
    totalBeforeTax = (subTotal + shipFee) - sumDiscount // totalBeforeTax => total price of every product plus shipping fee
    console.log('total before tax: ', totalBeforeTax)

    vat = (totalBeforeTax * 7) / 100   // VAT 7% that was already include in product price
    console.log('vat: ', vat)

    grandTotal = subTotal - vat   // Actual total price of product before VAT
    console.log('Calculate all value at the end of tax invoice', grandTotal)
    

    const finalOrder = {
      orderData: orderData,
      subtotal: totalBeforeTax,
      discount: sumDiscount,
      shipFee: shipFee,
      vat: vat,
      gtotal: grandTotal    
    }

    const date = new Date().toLocaleDateString()

  const htmlTemplate = fs.readFileSync('./model/invoiceTemplate.hbs', 'utf8')
  const invoiceTemplate = Handlebars.compile(htmlTemplate)

  invoice_pdf = invoiceTemplate({
    finalOrder: finalOrder, 
    customerData: customerData,
    date: date
  })

});

    });
    // Save customerData to mongodb
    NewCustomerData.save(); 
    // redirect to main page
    res.redirect("/download"); 
}) // Post customer data

app.post('/download-file', (req,res) => {
  pdf.create(invoice_pdf).toFile('taxinvoice.pdf', 
  (err, res) => {
    if (err) {
        return console.log(err);
    } else console.log(`PDF file saved to ${res.filename}`);
  }
);
}) // Post downlaod file


app.get('/download', (req, res) => {
  // render the next page here
  res.sendFile(__dirname + '/view/download.html');
});

// run app on local server
// app.listen(port,'0.0.0.0')
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})// // console.log('Server started at http://localhost:' + port);
