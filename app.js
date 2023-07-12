const { config } = require('dotenv'); 
const express = require('express');
const { join } = require('path');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');

// .env ? 
config();

const con = mysql.createConnection({
    host: process.env.MYHOST,
    user: process.env.ADMIN, 
    password: process.env.PW, 
    database: process.env.DB, 
    port: process.env.DBPORT
})

app.use(express.static(join(__dirname, '/public'))); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.sendFile(join(__dirname,'public', 'index.html')); 
}); 

app.get('/about', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'about/about.html')); 
}); 

app.get('/auth/signup', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'auth/signup.html'));
})

app.get('/auth/login', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'auth/login.html'));
})

app.get('/auth/forgot', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'auth/forgot.html'));
})

app.get('/education', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'education/ed.html'));
})

app.get('/education/vid', (req, response) => {
    console.log(req.cookies['knw']);
    // const issue = jwt.verify(req.cookies['knw'], process.env.KEY);
    jwt.verify(req.cookies['knw'], process.env.KEY, function (err, decoded) {
        if (err) {
            // console.log(err);
            response.redirect('/');
            console.log('youre being redirected');
        }
        else {
            console.log('enjoy');
            response.sendFile(join(__dirname, 'public', 'education/vid.html'));
        }
    });
})

app.post('/signup', (req, res) => {
    const firstname = req.body.firstname;
    const lastname  = req.body.lastname;
    const email     = req.body.email;
    const phone     = req.body.phone;
    const password  = req.body.password;
    const hashPW = bcrypt.hashSync(password, 10)
    console.log('hash is ' + hashPW);
    res.redirect('/auth/login.html');
    
    con.connect(function(err) {
        if (err) {
            throw err;
        }
        const sql = "INSERT INTO users (firstname, lastname, email, phone, password, hashPW) VALUES ('"+firstname+"','"+lastname+"','"+email+"','"+phone+"','"+password+"','"+hashPW+"')";
        con.query(sql, function (err, result) {
            if (err) {
                throw err;
            }
            console.log(result);    
        });
    });
   
})

app.post('/login', (req, response) => {
    const email    = req.body.email; 
    const pw = req.body.password;
  
    const sql = "SELECT hashPW from users WHERE email= '"+email+"'";
    con.query(sql, (err, resultSQL) => {
        if (err) {
            console.log(err);
        }
        // accessing the value of the object
        console.log("1 " + typeof(resultSQL));
        console.log("2 " + typeof(resultSQL[0]));
        console.log('3 ' + typeof(resultSQL[0].hashPW));
        console.log("4 " + resultSQL);
        console.log("5 " + resultSQL[0]);
        console.log('6 ' + resultSQL[0].hashPW);
        const hashMatch = bcrypt.compareSync(pw, resultSQL[0].hashPW);
        console.log("hash match is " + hashMatch); 
        if (hashMatch == 0) {
            console.log('Error with username and password combination. Please try again.')
            console.log('you are being re');
            response.redirect('/auth/login.html');
            console.log('yes you are');
        }
        else {
            const initialToken = jwt.sign(email, process.env.KEY);
            console.log(initialToken);
            // set key and value for cookie
            response.cookie('_knw', initialToken, {maxAge: 6000000, httpOnly: true, secure: true, sameSite: 'Strict', priority: 'High'});
            response.redirect('/');
        }
    });
    con.end();
});

const PORT = process.env.LISTENPORT || 5000;

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
})