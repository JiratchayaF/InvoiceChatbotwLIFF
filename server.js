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
const port = process.env.PORT || 3000;

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
  taxID: String,
  mobileNum: String
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
let finalOrder = {}

app.post('/request-submitted', (req,res) => {
  //post customers data in to mongodb by request the OrderNumber of submited form
    orderNumber = req.body.OrderNumber;
    let NewCustomerData = new CustomerData({
      orderNumber: req.body.OrderNumber,
      firstname: req.body.first_name,
      lastname: req.body.last_name, 
      address: req.body.Address,
      taxID: req.body.ID_Number,
      mobileNum: req.body.mobileNum,
    });

    // Define collection customerdatas model
    const CustomerDatas = mongoose.model('customerdatas', {
      _id: Number,
      orderNumber:String,
      firstname: String,
      lastname: String,
      address: String,
      taxID: String,
      mobileNum: String
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

        console.log('Merged customerData with orderData')
        // customerData obj dataMerged[0]
       const customerData = {
        orderNumber: dataMerged[0].orderNumber,
        firstName: dataMerged[0].firstname,
        lastName: dataMerged[0].lastname,
        address: dataMerged[0].address,
        taxID: dataMerged[0].taxID,
        mobileNum: dataMerged[0].mobileNum,
        }

      let orderData = []
      let orderArray = []

       // orderData obj: dataMerged[1] to dataMerged[i] are orderData obj
       for (let i = 1; i < dataMerged.length; i++) {
        orderArray = dataMerged[i]
        orderData.push({
          prodName: orderArray.productName,
          prodId: orderArray.productNumber,
          price: parseFloat(orderArray.productPrice).toFixed(2),          
          quantity: orderArray.productQuantity,
          shipFee: orderArray.shipFee,
          discount: orderArray.productPrice,
          linePoints: orderArray.productPrice,
          lspDiscount: orderArray.productPrice,
          total: orderArray.productPrice * orderArray.productQuantity,

          totalFloat: parseFloat(orderArray.productPrice * orderArray.productQuantity).toFixed(2)
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
    totalBeforeTax = (subTotal + shipFee) - sumDiscount // totalBeforeTax => total price of every product plus shipping fee
    vat = (totalBeforeTax * 7) / 100   // VAT 7% that was already include in product price
    grandTotal = subTotal - vat   // Actual total price of product after VAT
    console.log('Calculate value-at-the-end')

    finalOrder = {
      customerData: customerData,
      orderData: orderData,
      orderNumber: customerData.orderNumber,
      subtotal: parseFloat(totalBeforeTax).toFixed(2),
      discount: parseFloat(sumDiscount).toFixed(2),
      shipFee: parseFloat(shipFee).toFixed(2),
      vat: parseFloat(vat).toFixed(2),
      gtotal: parseFloat(grandTotal).toFixed(2)  
    }

    console.log('Charot is preparing your data....')
    
  const date = new Date().toLocaleDateString()
  const imgPath = path.resolve(__dirname, './public/logo.png')

  Handlebars.registerHelper('addOne', function(value) {
    return value + 1;
  });

  const htmlTemplate = fs.readFileSync('./model/invoiceTemplate.hbs', 'utf8')
  const invoiceTemplate = Handlebars.compile(htmlTemplate)

  invoice_pdf = invoiceTemplate({
    finalOrder: finalOrder, 
    customerData: customerData,
    date: date,
    imgPath: imgPath
  })
  console.log('Charot has filled e-tax invoice and ready to be donwload!')

})

    });
    // Save customerData to mongodb
    NewCustomerData.save(); 

    // redirect to request-submitted
    res.redirect('/request-submitted'); 
}) // Post customer data

// Show download page after submit form
app.get('/request-submitted', (req, res) => {
  res.sendFile(__dirname + '/view/download.html');
});

// Redirect to '/download-file' after click download button
app.post("/download-e-tax-inv", (req, res) => {
  pdf.create(invoice_pdf).toStream((err, stream) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=TAXINV_${finalOrder.orderNumber}.pdf`)
    stream.pipe(res);
  })
  console.log(`TAXINV_${finalOrder.orderNumber} is downloaded`)
})

// run app on local server
// app.listen(port,'0.0.0.0')
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})// // console.log('Server started at http://localhost:' + port);
