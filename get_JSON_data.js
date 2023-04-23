// Requiring mongoose module
const mongoose = require('mongoose');
const readline = require('readline');
const url = 'mongodb+srv://fuengjiratchaya:mongotest123@testmongo.wxnjfzh.mongodb.net/InvoiceData'
// Connecting to database
mongoose.set("strictQuery", false);

// db connection
mongoose.connect(url, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true
  })

.then(() => {
    console.log('Connected to database');
    // user input
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
      });
      rl.question('Enter a order number: ', (value) => {
      const myConst = value;
      const CustomerDatas = mongoose.model('customerdatas', {
        _id: Number,
        orderNumber:String,
        firstname: String,
        lastname: String,
        address: String,
        taxID: String
    });
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
    
    // find the specific order number from CustomerDatas
    CustomerDatas.find({orderNumber: myConst}, (err, customerDatas) => {
        if (err) throw err;
  
    // find the specific order number from Transactions
    Transactions.find({orderNumber: myConst}, (err, transactions) => {
        if (err) throw err;
    
    // Merge the results and print them to the console
    const dataMerged = [...customerDatas, ...transactions];
    const dataResult = JSON.stringify(dataMerged)
    // console.log('Merged results:', dataMerged);
    console.log(dataResult);
  });
});
      })})

