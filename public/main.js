
const wrongText = document.getElementById('if-wrong-display');
const wrongRegister = document.getElementById('register-wrong');

let myIntervalLogin;
let myIntervalRegister;

function keepCheckingLogin(){
    fetch('http://localhost:3000/shouldLogin')
    .then((response) => response.json())
    .then((data) => {
        if(data.somethingWrong!=undefined){
            if(data.somethingWrong==true){
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
    fetch('http://localhost:3000/shouldLogin')
    .then((response) => response.json())
    .then((data) => {
        myIntervalLogin = setInterval(keepCheckingLogin, 500);
    })

}

function keepCheckingRegister(){
    fetch('http://localhost:3000/shouldregister')
    .then((response) => response.json())
    .then((data) => {
        if(data.tooYoungOrOld==true){
            clearInterval(myIntervalRegister);
            wrongRegister.innerHTML = 'IS something wrong with your age?';
            wrongRegister.style.visibility = 'visible';
            window.stop();
        } else{
            if(data.notRegister!=undefined){
                if(data.notRegister==false){
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
    fetch('http://localhost:3000/shouldregister')
    .then((response) => response.json())
    .then((data) => {
        myIntervalRegister = setInterval(keepCheckingRegister, 500);
    })

}