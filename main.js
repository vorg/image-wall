var express = require("express");
var upload = require('jquery-file-upload-middleware');
var bodyParser = require('body-parser');

var app = express();

// configure upload middleware
upload.configure({
  uploadDir: __dirname + '/public/uploads',
  uploadUrl: '/uploads',
  imageVersions: {
    thumbs: {
      width: 80,
      height: 80
    },
    medium: {
      width: 320,
      height: 800
    }
  }
});

/// Redirect all to home except post
app.get('/upload', function( req, res ){
  res.redirect('/');
});

app.put('/upload', function( req, res ){
  res.redirect('/');
});

app.delete('/upload', function( req, res ){
  res.redirect('/');
});

app.use('/upload', upload.fileHandler());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

app.use('/list', function (req, res, next) {
  upload.fileManager().getFiles(function (files) {
    res.json(files);
  });
});

console.log('Starting server at port 3001');
app.listen(3001);