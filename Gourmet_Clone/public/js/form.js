document.addEventListener("DOMContentLoaded", () => {
    // Get forms
    const loginForm = document.getElementById("Login").querySelector("form");
    const signUpForm = document.getElementById("SignUp").querySelector("form");

    // Login Form Validation
    loginForm.addEventListener("submit", validateLoginForm);

    // Sign Up Form Validation
    signUpForm.addEventListener("submit", validateSignUpForm);
});

function validateLoginForm(event) {
    event.preventDefault();
    document.getElementById("loginEmailError").textContent = '';
    document.getElementById("loginPasswordError").textContent = '';

    const email = event.target.email.value.trim();
    const password = event.target.password.value.trim();

    let valid = true;

    // Validate email
    if (email === "") {
        document.getElementById("loginEmailError").textContent = "* Email is required.";
        valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        document.getElementById("loginEmailError").textContent = "Invalid email format.";
        valid = false;
    }

    // Validate password
    if (password === "") {
        document.getElementById("loginPasswordError").textContent = "* Password is required.";
        valid = false;
    }

    if (valid) {
        event.target.submit();
    }
}

function validateSignUpForm(event) {
    // Prevent form submission
    event.preventDefault();

    // Clear previous error messages
    document.getElementById("signUpUsernameError").textContent = '';
    document.getElementById("signUpFirstNameError").textContent = '';
    document.getElementById("signUpLastNameError").textContent = '';
    document.getElementById("signUpGenderError").textContent = '';
    document.getElementById("signUpDOBError").textContent = '';
    document.getElementById("signUpPasswordError").textContent = '';
    document.getElementById("signUpConfirmPasswordError").textContent = '';

    // Get form values
    const username = event.target.username.value.trim();
    const firstName = event.target.first_name.value.trim();
    const lastName = event.target.last_name.value.trim();
    const gender = event.target.gender.value;
    const dob = new Date(event.target.date.value);
    const currentDate = new Date();
    const password = event.target.password.value.trim();
    const confirmPassword = event.target.confirm_password.value.trim();

    let valid = true;

    // Validate each field
    if (username === "") {
        document.getElementById("signUpUsernameError").textContent = "*";
        valid = false;
    }
    if (firstName === "") {
        document.getElementById("signUpFirstNameError").textContent = "*";
        valid = false;
    }
    if (lastName === "") {
        document.getElementById("signUpLastNameError").textContent = "*";
        valid = false;
    }
    if (gender === "") {
        document.getElementById("signUpGenderError").textContent = "*";
        valid = false;
    }

    if (isNaN(dob.getTime()) || dob >= new Date(currentDate.getFullYear() - 13, currentDate.getMonth(), currentDate.getDate())) {
        document.getElementById("signUpDOBError").textContent = "Inappropriate age.";
        valid = false;
    }

    if (password === "") {
        document.getElementById("signUpPasswordError").textContent = "*";
        valid = false;
    } else if (password.length < 8) {
        document.getElementById("signUpPasswordError").textContent = "Password must be at least 8 characters.";
        valid = false;
    } else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])/.test(password)) {
        document.getElementById("signUpPasswordError").textContent = "Password must contain uppercase, number, and special character.";
        valid = false;
    }

    if (confirmPassword === "") {
        document.getElementById("signUpConfirmPasswordError").textContent = "*";
        valid = false;
    } else if (password !== confirmPassword) {
        document.getElementById("signUpConfirmPasswordError").textContent = "Passwords do not match.";
        valid = false;
    }

    if (valid) {
        alert("Sign-up successful!");
        signUpForm.submit();
    } 
}

// Tab functionality
function openTab(evt, tabName) {
    // Hide all tab content
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";  // Hide all forms
    }

    // Remove the active class from all tab links
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the selected tab and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// Open the default tab (Login) on page load
document.getElementById("defaultOpen").click();
