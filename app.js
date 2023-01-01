const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const mydate = require('current-date');

const con = mysql.createConnection({
    host: "trinbank-db.c40s53yigyat.us-east-1.rds.amazonaws.com",
    user: "trinAdminAntonio",
    password: "m0pIk2oCute",
    database: "customer_details"
})

const app = express();
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

let shouldThisUserLogin;
let shouldThisUserRegister;
let tooYoungOrOld;
let authentication;

let currentUserEmail;


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
        tooYoungOrOld = true;
        shouldThisUserRegister = false;
    } else{
        tooYoungOrOld = false;
        con.connect(function(err){
            con.query(`SELECT * from information WHERE email = '${email}'`,
            function(err, rows){
                if (err) throw err;
                if(rows[0]!=undefined){
                    shouldThisUserRegister = false;
                } else{
                    shouldThisUserRegister = true;
                    var sql = "INSERT INTO information (full_name, birth_date, age, email, password) VALUES ?";
                    var values = [
                        [fullName, birthDate, age, email, password]
                    ]
                    con.query(sql, [values], function(err, result){
                        if(err) throw err;
                    });
                    res.redirect("/succefull");
                }
            })
        })
    }

}

function loginUser(userEmail, userPassword, res){
    con.connect(function(err){
        con.query(`SELECT * from information WHERE email = '${userEmail}'`, 
        function(err, rows){
            if (err) throw err;
            try {
                rows[0].email;
                if(userPassword==rows[0].password){
                    currentUserEmail = userEmail;

                    res.redirect("/home"+authentication);
                    shouldThisUserLogin = true;
                } else{
                    shouldThisUserLogin = false;
                }
            } catch (error) {   
                shouldThisUserLogin = false;
            }
        })
    }); 
}

function deleteUser(res){

    let key = Math.random()*1000;
    key = (key+"").split(".")[1];
    let onlyPageKey = key;

    con.connect(function(err){
        con.query(`DELETE FROM information WHERE email='${currentUserEmail}'`,
        function(err){
            if (err) throw err;
            app.get("/deleted", function(req, res){
                res.render("deleted.html", {
                    email: currentUserEmail,
                });
            })
            res.redirect('/deleted');
        }
        )
    })
}

app.get("/test",function(req,res){
    res.render('test.html');
})

app.post("/test1", function(req, res){
    var id = req.params.id
    console.log(id);
})


app.post("/login", function(req, res){
    let userEmail = req.body.email;
    let userPassword = req.body.password;

    let key = Math.random()*1000;
    key = (key+"").split(".")[1];
    
    loginUser(userEmail, userPassword, res);

    authentication = userEmail+'=login&'+key;

    app.get("/home"+ authentication, function(req, res){
        res.render("home.html");
    })
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
    app.delete('/deleted');
    deleteUser(res);
})

app.get("/", function(req, res){
    res.redirect("/login");
})

app.get("/login", function(req, res){
    res.render("login.html");
})

app.get("/register", function(req, res){
    res.render("register.html");
})

app.get("/succefull", function(req, res){
    res.render("succefull.html");
})

app.get("/shouldLogin", function(req,res){
    res.send({somethingWrong: shouldThisUserLogin})
})

app.get("/shouldregister", function(req,res){
    res.send({notRegister: shouldThisUserRegister, tooYoungOrOld:tooYoungOrOld})
})

app.listen(3000, function(req, res){
    console.log('Server on in port 3000');
})