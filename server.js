const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
const Handlebars = require('handlebars');
const xmlbuilder = require('xmlbuilder');
const { SignedXml } = require('xml-crypto');
const pdf = require('html-pdf');
const forge = require('node-forge')
const xmlFormatter = require('xml-formatter');
require('dotenv').config()

// connect to DB
const password = process.env.MONGODB_PASSWORD
const url = `mongodb+srv://fuengjiratchaya:${password}@testmongo.wxnjfzh.mongodb.net/InvoiceData`;
const app = express();

// Define server port
const port = process.env.PORT || 80;

// view engine setup
app.set('view', express.static(path.join(__dirname, '/view')))
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
  mobileNum: String,
  invoiceDownloaded: Boolean
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
let invoiceData 
let formattedXml

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
      mobileNum: String,
      invoiceDownloaded: Boolean
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
        invoiceDownloaded: false
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
          discount: orderArray.discount,
          linePoints: orderArray.linePoints,
          lspDiscount: orderArray.lspDiscount,
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
    console.log(finalOrder)
    console.log('Charot is preparing your data....')

    // Construct tax-invoice.xml

    doc = xmlbuilder.create(`TAXINV_${finalOrder.orderNumber}_copy`)
    const dummyDate = new Date()
    const signedDate = dummyDate.toISOString()
    const invNum = Math.random();

    doc.ele('InvoiceHeader')
        .ele('Vendor')
          .ele('Name')
            .txt('Bringhome.theBacon')
          .up() // end of Name
          .ele('Address')
            .txt('24/56 Bang Na-Trat Rd, Tambon Bang Sao Thong, Amphoe Bang Sao Thong, Chang Wat Samut Prakan 10540')
          .up() // end of Address
          .ele('Phone')
            .att('type', 'telNumber')        
            .txt('0987490837') 
          .up() // end of Phone
          .ele('TaxId')
            .att('schemaID', 'TaxID')        
            .txt('123456789012') 
          .up() // end of taxId
          .up() // end of Vendor

          .ele('Customer')
            .ele('CustomerInfo')
              .ele('CustomerName')
                .ele('FirstName')
                  .txt(finalOrder.customerData.firstName)
                .up() // end of FirstName
                .ele('LastName')
                  .txt(finalOrder.customerData.lastName)
                .up() // end of LastName
              .up() // end of CustomerName
                .ele('Address')
                  .txt(finalOrder.customerData.address)
                .up()
                .ele('Phone')
                  .txt(finalOrder.customerData.mobileNum)
                .up()
                .ele('TaxId')
                  .txt(finalOrder.customerData.taxID)
                .up()
              .up() // end of CustomerInfo

            .ele('OrderHeaderInfo')
              .ele('IssuedDateTime')
                .txt(signedDate)
                .up() // end of IssuedDateTime
              .ele('TaxInvoiceNumber')
                .txt(invNum)
                .up()
              .ele('OrderNumber')
                .txt(finalOrder.orderNumber)
                .up()
              .up() // end of OrderHeaderInfo
            .up() // end of Customer
        .up() // end of InvoiceHeader
    
    // Loop displaying orderData
    let count = 1
    const orderDatas = doc.ele('OrderDetails');
    for (const order of finalOrder.orderData) {
      orderDatas.ele('ProductDetails')
          .att('id', count++)
          .ele('ProductID')
            .txt(order.prodId)
          .up() // end of ProductId
          .ele('ProductName')
            .txt(order.prodName)
          .up() // end of ProductName
          .ele('UnitPrice')
            .txt(order.price)
          .up() // end of UnitPrice
          .ele('Quantity')
            .txt(order.quantity)
          .up() // end of Quantity
          .ele('TotalPrice')
            .txt(order.totalFloat)
          .up() // end of TotalFloat
        .up() // end of Products
    }
    
    doc.ele('EndofBillCalculation')
        .ele('TotalBeforeVAT')
          .txt(finalOrder.subtotal)
        .up() // end of Subtotal
        .ele('Discount')
          .txt(finalOrder.discount)
        .up() // end of Discount
        .ele('ShipFee')
          .txt(finalOrder.shipFee)
        .up() // end of ShipFee
        .ele('VAT')
          .txt(finalOrder.vat)
        .up() // end of VAT
        .ele('GrandTotal')
          .txt(finalOrder.gtotal)
        .up() // end of SubTotal
        
    const xpath = `//*[local-name()="TAXINV_${orderNumber}"]`
  
    const xml = doc.end({ pretty: true })
  
    // // Add XadES signature to finalOrder object
    const sig = new SignedXml()

    // Read the private key file and set it as the signing key
    const privateKey = fs.readFileSync('./built/private_key.pem', 'utf-8')
    sig.signingKey = {
      key: privateKey,
      passphrase: process.env.PRIVATE_KEY_PASSPHRASE
    }

    var certificate = fs.readFileSync('./built/certificate.pem', 'utf-8')
    var encodedCertificate = Buffer.from(certificate).toString('base64');
    sig.keyInfoProvider = {
      getKeyInfo() {
        return `<X509Data><X509Certificate>${encodedCertificate}</X509Certificate></X509Data>`;
      }
    }

    const date = new Date().toLocaleDateString()
    
    sig.addReference(xpath, ['http://www.w3.org/2000/09/xmldsig#enveloped-signature'])
    sig.computeSignature(xml)
    let signedXml = sig.getSignedXml()

    const objectXml = '<Object></Object>';
    const cert = forge.pki.certificateFromPem(certificate);
    const issuerName = cert.issuer.attributes.map(attr => `${attr.shortName}=${attr.value}`).join(', ');
    const serialNumber = cert.serialNumber.toString();

    // Create the qualifying properties
    const qualifyingPropertiesXml = `<xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#xmldsig-69b3d670-04e4-419f-8d45-938ea867f571"><xades:SignedProperties Id="xmldsig-69b3d670-04e4-419f-8d45-938ea867f571-signedprops"><xades:SignedSignatureProperties><xades:SigningTime>${signedDate}</xades:SigningTime><xades:SigningCertificate><xades:Cert><xades:CertDigest><DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" /><DigestValue>${encodedCertificate}</DigestValue></xades:CertDigest><xades:IssuerSerial><X509IssuerName>${issuerName}</X509IssuerName><X509SerialNumber>${serialNumber}</X509SerialNumber></xades:IssuerSerial></xades:Cert></xades:SigningCertificate></xades:SignedSignatureProperties></xades:SignedProperties></xades:QualifyingProperties>`
  
    // Add the qualifying properties to the object
    const objectWithQualifyingPropertiesXml = objectXml.replace('</Object>', qualifyingPropertiesXml + '</Object>');
    
    // Add the object to the signed XML document
    const signedXmlWithObject = signedXml.replace('</Signature>', objectWithQualifyingPropertiesXml + '</Signature>');
    console.log(signedXmlWithObject) 

    formattedXml = xmlFormatter(signedXmlWithObject, {
      collapseContent: true, // Remove line breaks within text content
      indentation: '  ' // Specify the desired indentation (e.g., two spaces)
    })
    console.log(formattedXml)

    const baseDir = './taxinv_copy'; // Replace with the desired folder path

    const currentDate = new Date().toISOString().slice(0, 10);
    const folderPath = path.join(baseDir, currentDate)

    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }    

    // Create the file path by appending the file name to the folder path
    const filePath = path.join(folderPath, `TAXINV_${finalOrder.orderNumber}_copy.xml`);

    // Write the XML content to the file
    fs.writeFileSync(filePath, formattedXml, 'utf8');  

    Handlebars.registerHelper('addOne', function(value) {
    return value + 1;
  })

  const htmlTemplate = fs.readFileSync('./public/invoiceTemplate.hbs', 'utf8')
  const invoiceTemplate = Handlebars.compile(htmlTemplate)

  invoiceData = invoiceTemplate({
    finalOrder: finalOrder, 
    customerData: finalOrder.customerData,
    date: date,
  })

})

    });
    // Save customerData to mongodb
    NewCustomerData.save(); 

    // redirect to request-submitted
    res.redirect('/request-submitted'); 
}) // Post customer data

// Show download page after submit form
app.get('/request-submitted', (req, res) => {

  // // แก้บัคพรุ่งนี้
  // Check if the orderNumber has been filled
  CustomerData.findOneAndUpdate({orderNumber: orderNumber}, {invoiceDownloaded: true}, (err, result) => {
    if (err) throw err;

    if (!result) {
      res.status(400).send('No order found with the given order number.')
    } else {
            
      res.sendFile(__dirname + '/view/download.html')
    }
  })
})

// Redirect to '/download-file' after click download button
app.post("/download-tax-inv", (req, res) => {
  pdf.create(invoiceData).toStream((err, stream) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=TAXINV_${finalOrder.orderNumber}.pdf`)
    stream.pipe(res);
  })
  console.log(`TAXINV_${finalOrder.orderNumber} is downloaded`)

  // // Define the base directory where the daily folders will be created
  // const baseDir = './taxinv_copy'

  // // Create a folder name based on the current date (e.g., '2023-05-18')
  // const currentDate = new Date().toISOString().slice(0, 10);
  // const folderName = path.join(baseDir, currentDate);

  // // Check if the folder already exists
  // if (!fs.existsSync(folderName)) {
  //   // Create the folder if it doesn't exist
  //   fs.mkdirSync(folderName, { recursive: true });
  // }

  // // Create the file path by appending the file name to the folder path
  // const filePath = path.join(folderName, `TAXINV_${finalOrder.orderNumber}_copy.xml`);

  // // Write the XML content to the file
  // fs.writeFileSync(filePath, signedXml, 'utf8');
})

// run app on local server
// app.listen(port,'0.0.0.0')

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})