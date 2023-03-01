const express = require('express');
const path = require('path');
// const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient
// connect to DB
// const dbConnect = mongodb.MongoClient.connect('mongodb://localhost:27017/ChatBotInvoiceTest');
const url = 'mongodb+srv://fuengjiratchaya:mongotest123@testmongo.wxnjfzh.mongodb.net/'
const app = express();

// รอcomment
const port = process.env.PORT || 8080;
//

app.use(express.json())

// db connection
MongoClient.connect(url, { 
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

app.post('/post-custmer-data', function(req,res){
    dbConnect.then(function(db) {
        delete req.body._id; // for safety reasons
        db.collection('ChatBotINVTest').insertOne(req.body);
    });    
    res.send('Data received:\n' + JSON.stringify(req.body));
}); 

app.get('/', function(req, res, next) {

    res.sendFile(path.join(__dirname,'LIFF/index.html'));

});
// รอcomment
app.listen(port);
console.log('Server started at http://localhost:' + port);
//