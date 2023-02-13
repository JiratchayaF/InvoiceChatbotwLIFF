const express = require('express');
const path = require('path');
const app = express();
// รอcomment
const port = process.env.PORT || 8080;

app.use(express.urlencoded());

app.get('/', function(req, res, next) {

    res.sendFile(path.join(__dirname,'LIFF/index.html'));

});
// รอcomment
app.listen(port);
console.log('Server started at http://localhost:' + port);
