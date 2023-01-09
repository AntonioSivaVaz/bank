const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const mydate = require('current-date');
const cookieParser = require('cookie-parser');

require("dotenv").config();

const con = mysql.createConnection({
    host: process.env.hostLink,
    user: process.env.databaseUser,
    password: process.env.databasePassword,
    database: process.env.databaseName
})

const app = express();
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(cookieParser());

//DATABSE INTERECTIONS

function getAge(userBirthYear, userBirthMonth, userBirthDay){

    let currentYear  =  parseInt(mydate(('date')).substr(0,4));
    let currentMonth =  parseInt(mydate(('date')).substr(5,2));
    let currentDay   =  parseInt(mydate(('date')).substr(8,2));
    let age;
    
    let diferenceYear = currentYear - userBirthYear;
    let diferenceMonth = userBirthMonth - currentMonth;
    let diferenceDay = userBirthDay - currentDay;
    
    if(diferenceMonth<0){
        age = diferenceYear;
    } else if(diferenceMonth==0){
        if (diferenceDay>0) {
            age = diferenceYear - 1;
        } else{
            age = diferenceYear;
        }
    } else{
        age = diferenceYear - 1;
    }
    return age;
}

function insertDataIntoDatabase(fullName, birthDate, age, email, password, res){
    if(age<18 || age>110){
        process.env.tooYoung = "true";
        process.env.shouldRegister = "false";
    } else{
        process.env.tooYoung = false;
        con.connect(function(err){
            con.query(`SELECT * from information WHERE email = '${email}'`,
            function(err, rows){
                if (err) throw err;
                if(rows[0]!=undefined){
                    process.env.shouldRegister = "false";
                } else{
                    process.env.shouldRegister = "true";

                    var id = Math.random().toString(36).slice(-8);

                    var pointer = Math.random()*1000;
                    pointer = (pointer+"").split(".")[1];

                    var sql = "INSERT INTO information (full_name, birth_date, age, email, password, id, pointer) VALUES ?";
                    var values = [
                        [fullName, birthDate, age, email, password, id, pointer]
                    ]
                    con.query(sql, [values], function(err, result){
                        if(err) throw err;
                    });
                    res.redirect("/succefull");
                    process.env.succefullPage = 'true';
                }
            })
        })
    }
}

function loginUser(userEmail, userPassword, res, authentication){
    con.connect(function(err){
        con.query(`SELECT * from information WHERE email = '${userEmail}'`, 
        function(err, rows){
            if (err) throw err;
            try {
                rows[0].email;
                if(userPassword==rows[0].password){
                    con.query(`SELECT id,pointer from information WHERE email = '${userEmail}'`,
                    function(err, rows){
                        process.env.authentication = "&="+ rows[0].id + "&" + "&" +rows[0].pointer;
                        process.env.currentEmail = userEmail;
                        process.env.shouldLogin = true;
                        let accID = rows[0].id;
                        startHomePage();
                        res.redirect("/home"+process.env.authentication);
                    });
                } else{
                    process.env.shouldLogin = false;
                }
            } catch (error) {   
                process.env.shouldLogin = false;
            }
        })
    }); 
}

function deleteUser(res){

    let key = Math.random()*1000;
    key = (key+"").split(".")[1];
    let onlyPageKey = key;

    con.connect(function(err){
        con.query(`DELETE FROM information WHERE email='${process.env.currentEmail}'`,
        process.env.deletedPage = 'true',
        function(err){
            if (err) throw err;
            res.redirect('/deleted');
        }
        )
    })
}

//PAGES FUNCTION

function startHomePage (){
    app.get("/home"+process.env.authentication, function(req,res){
        if(process.env.authentication!="none"){
            res.cookie("login", "true");
            res.render("pages/home.html");
            process.env.authentication = "none";
        } else{
            if(req.cookies.login==="true"){
                res.render("pages/home.html");
            } else{
                res.redirect("/404");
            }
        }
    })
}

//POST ACTIONS


app.post("/login", function(req, res){
    let userEmail = req.body.email;
    let userPassword = req.body.password;
    loginUser(userEmail, userPassword, res);
})

app.post("/register_new_user", function(req, res){
    let fullName = req.body.fullName;
    let birthDate = req.body.birthDate;
    let email = req.body.email;

    let password = req.body.password;
    let birthYear = birthDate.substr(0,4);
    let birthMonth = birthDate.substr(5,2);
    let birthDay = birthDate.substr(8,2);

    let age = getAge(birthYear, birthMonth, birthDay);

    insertDataIntoDatabase(fullName, birthDate, age, email, password, res);
})

app.post("/delete", function(req ,res){
    deleteUser(res);
})

//GET ACTIONS

app.get("/", function(req, res){
    res.redirect("/login");
})

app.get("/login", function(req, res){
    res.render("pages/login.html");
})

app.get("/register", function(req, res){
    res.render("pages/register.html");
})

app.get("/succefull", function(req, res){
    if(process.env.succefullPage === 'true'){
        res.render("pages/succefull.html");
        process.env.succefullPage = 'false';
    } else {
        res.redirect("/404");
    }
})

app.get("/deleted", function(req, res){
    if(process.env.deletedPage==='true'){
        process.env.deletedPage = 'false',
        res.render("pages/deleted.html", {
            email: process.env.currentEmail,
        });
    } else{
        res.redirect("/404");
    }
})

app.get("/shouldLogin", function(req,res){
    res.send({somethingWrong: process.env.shouldLogin});
})

app.get("/shouldregister", function(req,res){
    res.send({notRegister: process.env.shouldRegister, tooYoungOrOld: process.env.tooYoung});
})

app.get("/404", function(req,res){
    res.render("pages/404.html");
})

//PORT SET

app.listen(process.env.PORT || 3000, function(req, res){
    console.log('Server on in port 3000');
})

// HANDLE OF ERROR PAGES //
function handleErrorPage(){
    app.get("*", function(req, res, next){
        if(req.url.slice(1,40)=="home"+process.env.authentication){
            next();
        } else{
            res.render("pages/404.html");
        }
    })
}

// Define middleware for all routes
app.use((req, res, next) => {
    next();
    handleErrorPage();
})
