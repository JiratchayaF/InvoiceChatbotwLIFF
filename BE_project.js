const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const mongoose = require('mongoose');
// connect to DB
// const dbConnect = mongodb.MongoClient.connect('mongodb://localhost:27017/ChatBotInvoiceTest');

const app = express();
// รอcomment
const port = process.env.PORT || 8080;

app.use(express.json())
// app.use(express.urlencoded());
// app.use(bodyParser.urlencoded({extended: false}));
// db connection
mongoose.connect('mongodb://localhost:27017/mydb',{
    useNewUrlParser:true,
    useUnifiedTopology:true
}, (err) => {
    if(!err)
    {
        console.log("connected to db");
    } else {
        console.log("error");
    }
})

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
