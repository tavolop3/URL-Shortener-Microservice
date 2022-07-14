require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser')
const validUrl = require('valid-url');
let mongoose = require('mongoose');


// Basic Configuration
const port = process.env.PORT;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

//connection with mongo
const uri = process.env['MONGO_URI'];
mongoose.connect(uri,{useNewUrlParser:true,useUnifiedTopology:true});
let Schema = mongoose.Schema;

let urlSchema = new Schema({
  url:{
    type:String,
    required:true,
    unique:true
  }
});
let urlModel = new mongoose.model("url",urlSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl',(req,res) => {
  let url = req.body.url;
  if (validUrl.isHttpUri(url)) {
    console.log('Looks like an URI'+" "+url);
    urlModel.findOne({'url':url},(err,data) => {
      if(data){
        res.json({original_url:url,short_url:data['_id']});
        console.log('found');
      }
      else{
        urlModel.create({'url':url},(er,data) =>{
          if(er) return console.error(er);
          res.json({original_url:url,short_url:data['_id']});
          console.log('created');
        })
      }
    })
  }
  else {
    res.json({error:'invalid url'});
    console.log('Not a URI');
  }
});

app.get('/api/shorturl/:shorturl',(req,res) => {
  let shortUrl = req.params.shorturl;
  urlModel.findById(shortUrl,(err,data) => {
    if(err) return console.error(err);
      res.status(301).redirect(data.url);
    })
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
