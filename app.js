const express = require('express'); //require a module
const app = express(); //just use a short variable
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const CONNECTION_URL = "mongodb+srv://wendyggx:Givelove148!@cluster0-alfjy.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "newdb"; //you can change the database name
var database, collection;
const https = require('https');
const querystring = require('querystring');
const cookieParser = require('mongodb').MongoClient;
var path = require('path');


app.use(cookieParser());
//use in all path
//for form submission
app.use(express.urlencoded({ extended: true}));

app.set("view engine", "ejs"); //to use html and token
app.use(express.static(path.join(__dirname, 'public')));

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


//this is a route
app.get("/", (req, res, next) => {
  res.render('home', {page:'Home', menuId:'home'}); //rendering html template on the app page
});

app.post("/submit", (req, res, next) => {
  //storing a submission into the database
  collection.insertOne(req.body, (err,results) => {
    if (err) return console.log(err)
    console.log('saved to database');
    //res.send('hello world')
  })

  // build the data object

    var postData = querystring.stringify({
        'email': req.body.email,
        'firstname': req.body.firstname,
        'subject': req.body.subject,
        'message': req.body.message,
        'hs_context': JSON.stringify({
            "hutk": req.cookies.hubspotutk,
            "ipAddress": req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            "pageUrl": "http://www.wendyggx.com/contact",
            "pageName": "Portfolio contact me"
        })
    });

// set the post options, changing out the HUB ID and FORM GUID variables.

    var options = {
    	hostname: 'forms.hubspot.com',
    	path: '/uploads/form/v2/Y4753304/3801c81f-9729-4c92-9e15-b6f767cf249d',
    	method: 'POST',
    	headers: {
    		'Content-Type': 'application/x-www-form-urlencoded',
    		'Content-Length': postData.length
    	}
    }

// set up the request

    var request = https.request(options, function(response){
    	console.log("Status: " + response.statusCode);
    	console.log("Headers: " + JSON.stringify(response.headers));
    	response.setEncoding('utf8');
    	response.on('data', function(chunk){
    		console.log('Body: ' + chunk)
    	});
    });

    request.on('error', function(e){
    	console.log("Problem with request " + e.message)
    });

    // post the data

    request.write(postData);
    request.end();

    res.redirect('/');

});

app.get("/contact", (req, res, next) => {
  res.render('contact', {page:'Contact', menuId:'contact'}); //rendering html template on the app page
});


app.get("/about", (req, res, next) => {
  res.render('about', {page:'About', menuId:'about'}); //rendering html template on the app page
});


//port in your computer for the app to run,
//0-6500, 3000 not being use by system
