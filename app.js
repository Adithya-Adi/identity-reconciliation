var express = require('express');
var app = express();
require('dotenv').config();
const db = require('./utils/connector');


app.use(express.json());

app.get('/', function (req, res) {
   res.send('Hello World');
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});