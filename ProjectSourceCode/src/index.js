const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.
const { get } = require('http');

//-------------------------------------------------------------------------------------------------

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(path.join(__dirname, 'views/resources')));

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/', (req, res) => { // code to redirect to login poage 
  res.redirect('/login');
});

app.get('/login', (req, res) => { // code to render  login page 
  res.render('pages/login');
});

app.get('/register', (req, res) => { // code to render register page 
  res.render('pages/register');
});


app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate username to ensure it's not empty or consisting only of whitespace characters
    if (!username || username.trim() === '') {
      res.status(400).json({ message: 'Invalid input: Username cannot be empty or contain only whitespace characters.' });
      return;
    }
    
    // Check if username already exists
    const userExists = await db.oneOrNone('SELECT * FROM users WHERE username = $1', username);
    
    if (userExists) {
      // Username already exists, return an error message to the user
      console.log(userExists);
      res.render('pages/register', { message: 'User already exists. Please choose a different username.' });
      return; // Prevent further execution to avoid attempting to insert the duplicate username
    }

    // If the username doesn't exist, continue with hashing the password and inserting the new user
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password for security
    await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);
    res.redirect('/login'); // Redirect the user to the login page upon successful registration
  } catch (error) {
    console.error('Error registering user:', error);
    res.render('pages/register', { message: 'Registration failed: ' + error.message }); // Show a generic error message for other errors
  }
});

app.get('/passwordReset' , async (req, res) => {
  res.render('pages/passwordReset');
})

app.post('/passwordReset', async (req, res) => {
  const { email } = req.body;
  // Assume emailRegex is your validation logic
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(email)) {
    // Email is in the correct format, proceed with logic and then render success page
    res.render('pages/success', { email }); // Pass the email as part of the rendering context
  } else {
    // Email is not in the correct format
    res.render('pages/passwordReset', { errorMessage: 'Email is not in valid format. It should be name@provider.com' });
  }
});



app.post('/login', async (req, res) => {
try {

  const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', req.body.username); // compare login credetials to those ones that exist
  
  if (!user) { // if user dose not match any exising users redirect to register page so they can register 
    res.redirect('/register');
    return;
  }
  
  const match = await bcrypt.compare(req.body.password, user.password);
  
    if (match) {
      req.session.user = user;
      req.session.save();
    res.status(200).redirect('/home')
  } else {
    res.status(401).render('pages/login', { message: 'Incorrect username or password.' }); // if username matches but credentils are incorrect message will display 
  }
} catch (error) {
  console.error('Error:', error);
  res.status(500).render('pages/login', { message: 'An error occurred. Please try again.' });
}
});

app.get('/api/convert_currency', (req,res)=>{
const apiKey = process.env.API_KEY; 
axios({
  method: 'get',
  url: 'https://api.currencyapi.com/v3/latest',
  params:{
    ...req.query,
    apikey: apiKey
  }
  })
.then(response=>{
  console.log(response);
  res.status(response.status).json(response.data);
})
.catch(error=>{
  console.error('Error', error)
  res.status(500).json({error: 'Error'});
});
});

// Authentication Middleware.
const auth = (req, res, next) => {
if (!req.session.user) {
  // Default to login page.
  return res.redirect('/login');
}
next();
};

// Authentication Required
app.use(auth);

app.get('/profile', (req, res) => {
  res.render('pages/profile');
});

app.get('/home', (req,res)=>{
  res.render('pages/home');
});

app.get('/currency_converter', (req,res)=>{
  res.render('pages/currency_converter');
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        console.error('Error destroying session:', err); // destroy current session and exit our of the login page 
        return res.redirect('/'); 
      }
      res.clearCookie('connect.sid');
      res.render('pages/logout')
    });
  });
  
  
  // *****************************************************
  // <!-- Section 5 : Start Server-->
  // *****************************************************
  // starting the server and keeping the connection open to listen for more requests
  module.exports = app.listen(3000);
  console.log('Server is listening on port 3000');



