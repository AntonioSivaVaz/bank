const wrongText = document.getElementById('if-wrong-display');
const wrongRegister = document.getElementById('register-wrong');

let myIntervalLogin;
let myIntervalRegister;
let url;

function getCurrentUrl(){
    var str = window.location.href;
    let indexes;
    for (let index = 0; index < str.length; index++) {
      if (str[index] === '/') {
        indexes = index;
      }
    }
    currentUrl = str.slice(0, indexes+1);
    return currentUrl;
}

function keepCheckingLogin(){
    url = getCurrentUrl();
    fetch(url + 'shouldLogin')
    .then((response) => response.json())
    .then((data) => {
        if(data.somethingWrong!="undefined"){
            if(data.somethingWrong=="true"){
                clearInterval(myIntervalLogin);
            } else{
                clearInterval(myIntervalLogin);
                wrongText.style.visibility = 'visible';
                window.stop();
            }

        }
    })
}

function checkIfLogin(){
    url = getCurrentUrl();
    fetch(url + 'shouldLogin')
    .then((response) => response.json())
    .then((data) => {
        myIntervalLogin = setInterval(keepCheckingLogin, 500);
    })

}

function keepCheckingRegister(){
    url = getCurrentUrl();
    fetch(url + 'shouldregister')
    .then((response) => response.json())
    .then((data) => {
        if(data.tooYoungOrOld=="true"){
            clearInterval(myIntervalRegister);
            wrongRegister.innerHTML = 'IS something wrong with your age?';
            wrongRegister.style.visibility = 'visible';
            window.stop();
        } else{
            if(data.notRegister!=undefined){
                if(data.notRegister=="false"){
                    clearInterval(myIntervalRegister);
                    wrongRegister.innerHTML = 'Email already registered';
                    wrongRegister.style.visibility = 'visible';
                    window.stop();
                }
            }
        }
    })
}

function checkRegister(){
    url = getCurrentUrl();
    fetch(url+'shouldregister')
    .then((response) => response.json())
    .then((data) => {
        myIntervalRegister = setInterval(keepCheckingRegister, 500);
    })
}