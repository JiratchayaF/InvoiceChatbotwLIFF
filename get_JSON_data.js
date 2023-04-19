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
    // find the specific order number from user
    CustomerDatas.find({orderNumber: myConst}, function(err, customerDatas) {
    // CustomerDatas.find({}, function(err, customerDatas) {
    if (err) {
      console.error(err);
      return;
    }
    // define customer data as variable
    const data = JSON.stringify(customerDatas)
    // Print the documents as JSON
    console.log(data);
    mongoose.connection.close();
  });
    });
    
})
	.catch(error => {
		console.log(error);
	})
