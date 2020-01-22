require('dotenv').config();
const express = require('express'); //require a module
const app = express(); //just use a short variable
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const CONNECTION_URL = "mongodb+srv://wendyggx:Givelove148!@cluster0-alfjy.mongodb.net/test?retryWrites=true&w=majority";
const DATABASE_NAME = "newdb"; //you can change the database name
var database, collection;
const https = require('https');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
var path = require('path');
const returnedCompanies = [];
const request = require('request-promise-native');
const NodeCache = require('node-cache');
const session = require('express-session');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
// Supports a list of scopes as a string delimited by ',' or ' ' or '%20'
const SCOPES = (process.env.SCOPE.split(/ |, ?|%20/) || ['contacts']).join(' ');

const REDIRECT_URI = `https://wendyggx.herokuapp.com/oauth-callback`;
//const REDIRECT_URI = `https://wendyggx.herokuapp.com/oauth-callback`;
const refreshTokenStore = {};
const accessTokenCache = new NodeCache({ deleteOnExpire: true });
const authUrl =
  'https://app.hubspot.com/oauth/authorize' +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` + // app's client ID
  `&scope=${encodeURIComponent(SCOPES)}` + // scopes being requested by the app
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`; // where to send the user after the consent page


// Use a session to keep track of client ID
app.use(session({
  secret: Math.random().toString(36).substring(2),
  resave: true,
  saveUninitialized: true,
  cookie: {
  	maxAge: 12 * 30 * 24 * 60 * 60 * 1000
  }
}));

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

  app.get('/install', (req, res) => {
    console.log('Initiating OAuth 2.0 flow with HubSpot');
    console.log("Step 1: Redirecting user to HubSpot's OAuth 2.0 server");
    res.redirect(authUrl);
    console.log('Step 2: User is being prompted for consent by HubSpot');
  });

  //this is a route
  app.get("/", (req, res, next) => {
    res.render('home', {page:'Home', menuId:'home'}); //rendering html template on the app page
  });

  app.get('/oauth-callback', async (req, res) => {
    console.log('Step 3: Handling the request sent by the server');

    // Received a user authorization code, so now combine that with the other
    // required values and exchange both for an access token and a refresh token
    if (req.query.code) {
      console.log('  > Received an authorization token');

      const authCodeProof = {
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: req.query.code
      };

      // Step 4
      // Exchange the authorization code for an access token and refresh token
      console.log('Step 4: Exchanging authorization code for an access token and refresh token');
      const token = await exchangeForTokens(req.sessionID, authCodeProof);
      if (token.message) {
        return res.redirect(`/error?msg=${token.message}`);
      }
      console.log(req.sessionID);
      // Once the tokens have been retrieved, use them to make a query
      // to the HubSpot API
      res.redirect(`about`);
    }
  });

  const exchangeForTokens = async (userId, exchangeProof) => {
    try {
      const responseBody = await request.post('https://api.hubapi.com/oauth/v1/token', {
        form: exchangeProof
      });
      // Usually, this token data should be persisted in a database and associated with
      // a user identity.
      const tokens = JSON.parse(responseBody);
      refreshTokenStore[userId] = tokens.refresh_token;
      accessTokenCache.set(userId, tokens.access_token, Math.round(tokens.expires_in * 0.75));

      console.log('  > Received an access token and refresh token');
      return tokens.access_token;
    } catch (e) {
      console.error(`  > Error exchanging ${exchangeProof.grant_type} for access token`);
      return JSON.parse(e.response.body);
    }
  };

  const refreshAccessToken = async (userId) => {
    const refreshTokenProof = {
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      refresh_token: refreshTokenStore[userId]
    };
    return await exchangeForTokens(userId, refreshTokenProof);
  };

  const getAccessToken = async (userId) => {
    // If the access token has expired, retrieve
    // a new one using the refresh token
    if (!accessTokenCache.get(userId)) {
      console.log('Refreshing expired access token');
      await refreshAccessToken(userId);
    }
    return accessTokenCache.get(userId);
  };

  const isAuthorized = (userId) => {
    return refreshTokenStore[userId] ? true : false;
  };

  app.post("/getCompanies", (req, res, next) => {
    var request = require("request")
    const API_KEY = 'aa0c900c-72e4-4659-883a-6ea71cc5b5b0'
    const limit = 250;
    var counter = 0;

    function getCompanies(offset) {
        if (typeof offset == 'undefined') {
            offsetParam = null;
        } else {
            offsetParam = `offset=${offset}`;
        }
        const hapikeyParam = `hapikey=${API_KEY}`
        const paramsString = `?limit=${limit}&${hapikeyParam}&${offsetParam}`;

        const finalUrl = `https://api.hubapi.com/engagements/v1/engagements/paged${paramsString}`
        console.log(finalUrl)
        request(finalUrl, (error, response, body) => {
            if (error) {
                console.log('error', error)
                throw new Error
            }
            const parsedBody = JSON.parse(body)
            parsedBody.results.forEach(company => {
                returnedCompanies.push(company);
                counter++;
            });
            if (parsedBody['hasMore']) {
                getCompanies(parsedBody['offset'])
                console.log(offset);
            } else {
                //print out all companies
                console.log(counter)
            }
        })
    };
    getCompanies();
    res.redirect('/getCompanies');
  });


    app.get('/getCompanies', function(req, res){
      res.send(JSON.stringify(returnedCompanies));
    //res.send(String(existingNotifications2.length));
    });

  app.post("/submit", (req, res, next) => {
    //storing a submission into the database
    collection.insertOne(req.body, (err,results) => {
      if (err) return console.log(err)
      console.log('saved to database');
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
    	path: '/uploads/form/v2/4753304/3801c81f-9729-4c92-9e15-b6f767cf249d',
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

    res.redirect('home');
});

app.get("/contact", (req, res, next) => {
  res.render('contact', {page:'Contact', menuId:'contact'}); //rendering html template on the app page
});


app.get("/about", (req, res, next) => {
  if (isAuthorized(req.sessionID)) {
    res.render('about', {page:'About', menuId:'about'}); //rendering html template on the app page
  } else {
    res.render('home', {page:'Home', menuId:'home'});
  }
});

app.post('/about', async (req, res) => {
  if (isAuthorized(req.sessionID)) {
    var searchInput = req.body.searchinput; // Store submitted form input into variable
    var url = 'https://api.hubapi.com/contacts/v1/search/query?q=' + searchInput;

    const contactSearch = async (accessToken) => {
     try {
      const headers = {
    	 Authorization: `Bearer ${accessToken}`,
    	 'Content-Type': 'application/json'
    	};
    	const data = await request.get(url, {headers: headers, json: true});
    	return data;
     } catch (e) {
      return {msg: e.message}
     }};

    const accessToken = await getAccessToken(req.sessionID);
    const searchResults = await contactSearch(accessToken);
    var contactResults = JSON.stringify(searchResults.contacts);
    var parsedResults = JSON.parse(contactResults);

    res.render('searchresults', {contactsdata: parsedResults});
} else {
  res.redirect('about');
}
});


//port in your computer for the app to run,
//0-6500, 3000 not being use by system
