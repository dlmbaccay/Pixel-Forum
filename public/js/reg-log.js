// Add event listener to radio buttons
const loginRadio = document.getElementById("loginRadio");
const regRadio = document.getElementById("regRadio");
const registrationForm = document.getElementById("registration-form");
const loginForm = document.getElementById("login-form");

loginRadio.addEventListener("change", function() {
if (loginRadio.checked) {
    registrationForm.style.display = "none";
    loginForm.style.display = "block";
}
});

regRadio.addEventListener("change", function() {
if (regRadio.checked) {
    registrationForm.style.display = "block";
    loginForm.style.display = "none";
}
});