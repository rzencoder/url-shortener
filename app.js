//Requirements
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const shortUrl = require('./models/shortUrl');
const validUrl = require('valid-url');

const app = express();
var url = process.env.MONGOLAB_URI;

mongoose.connect(url || 'mongodb://localhost/shortUrls');

app.set('view engine', 'pug')
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.render('index')
})

//Add url to database and give a short randon number as new url
app.get('/url/*', function (req, res) {
  let long = req.url.replace('/url/', '');

  if(validUrl.isUri(long)){
    let shortVal = Math.floor(Math.random()*10000).toString();
    let data = new shortUrl(
      {
        longUrl: long,
        smallUrl: shortVal
      }
    );
    data.save(function(error){
      if(error){
        return res.send('Error adding to database')
      }
    })
    return res.json({data});
  }
  else{
    return res.send('Invalid Url');
  }
})

app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});
//Redirect to old url in database
app.get('/:newUrl', function(req, res){
  var newUrl = req.params.newUrl;
  console.log(newUrl)
  shortUrl.findOne({'smallUrl': newUrl}, function(error, data){
    console.log(data)
    if(error){
      return res.send('Database Error');
    }
    else {
      if(validUrl.isUri(data.longUrl)){
        res.redirect(301, data.longUrl);
      }
      else {
        res.send('Database Error')
      }
    }
  })
})

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function() {
  console.log('app is now listening');
});
