const express = require('express');
//require a module
const app = express();
//just use a short variable

const MongoClient = require('mongodb').MongoClient;
var path = require('path')

MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true}, (error,client) => {
  if (error) throw error;

  database = client.db(DATABASE_NAME);
  collection = database.collection("newcollection");
  //you can change the collection name

  //start the application after the database connection is ready
  app.listen(port, () => {
    console.log('This app is running on port' + port);
  });
});

//use in all path
//for form submission
app.use(express.urlencoded({ extended: true}));


//to use html and token
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

const CONNECTION_URL = "mongodb+srv://wendyggx:Givelove148!@cluster0-alfjy.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "newdb"; //you can change the database name
var database, collection;

//this is a route
app.get("/", (req, res, next) => {
  res.render('home', {page:'Home', menuId:'home'}); //rendering html template on the app page
});

app.post("/submit", (req, res, next) => {
  //storing a submission into the database
  collection.insertOne(req.body, (err,results) => {
    if (err) return console.log(err)
    console.log('saved to database');
    res.send('hello world')
  });
});

app.get("/contact", (req, res, next) => {
  res.render('contact', {page:'Contact', menuId:'contact'}); //rendering html template on the app page
});


app.get("/about", (req, res, next) => {
  res.render('about', {page:'About', menuId:'about'}); //rendering html template on the app page
});


//port in your computer for the app to run,
//0-6500, 3000 not being use by system
