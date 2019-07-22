const express = require('express');
//require a module
const app = express();
//just use a short variable

//to use html and token
app.set("view engine", "ejs");

//this is a route
app.get("/", (req, res) => {
  res.render('home', {page:'Home', menuId:'home'}); //rendering html template on the app page
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/home.ejs');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('This app is running on port' + port);
});
//port in your computer for the app to run,
//0-6500, 3000 not being use by system
