const mainContainer = document.getElementById('main-container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

const signInButton = document.getElementById('sign-in-button');
const usernameSignInInput = document.getElementById('username-sign-in-input');
const passwordSignInInput = document.getElementById('password-sign-in-input');

const signUpButton = document.getElementById('sign-up-button');
const fullNameSignUpInput = document.getElementById('full-name-sign-up-input');
const usernameSignUpInput = document.getElementById('username-sign-up-input');
const passwordSignUpInput = document.getElementById('password-sign-up-input');
const confirmPasswordSignUpInput = document.getElementById('confirm-password-sign-up-input');
const genderSignUpInput = document.getElementById('gender-sign-up-input');

const alertPlaceholder = document.getElementById('liveAlertPlaceholder')



registerBtn.addEventListener('click', () => {
    mainContainer.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    mainContainer.classList.remove("active");
});

signInButton.addEventListener('click', () => {
    if (usernameSignInInput.value.length > 0 && passwordSignInInput.value.length >= 6) {
        const data = {
            username : usernameSignInInput.value,
            password : passwordSignInInput.value
        };
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data) 
        };
    
        fetch('/api/auth/login/', options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); 
            })
            .then(data => {
                console.log('Success:', data);

                setUserCookies(15, data.fullName, data.username, data.profilePic, data._id)

                window.location.href = "../html/students.html";
            })
            .catch(error => {
                console.error('Error:', error);
                appendAlert('Invalid username or password!', 'danger')
            });
    } else {
        appendAlert('Invalid username or password!', 'danger')
    }
});


signUpButton.addEventListener('click', () => {
    if (fullNameSignUpInput.value.length > 0 && 
        usernameSignUpInput.value.length > 0 && 
        passwordSignUpInput.value.length >= 6 && 
        passwordSignUpInput.value == confirmPasswordSignUpInput.value &&
        genderSignUpInput.value.length != ""
    ) {

        const data = {
            fullName : fullNameSignUpInput.value,
            username : usernameSignUpInput.value,
            password : passwordSignUpInput.value,
            confirmPassword : confirmPasswordSignUpInput.value,
            gender :  genderSignUpInput.value
        };
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data) 
        };
    
        fetch('/api/auth/signup/', options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); 
            })
            .then(data => {
                console.log('Success:', data);

                setUserCookies(15, data.fullName, data.username, data.profilePic, data._id)

                window.location.href = "../html/students.html";
            })
            .catch(error => {
                console.error('Error:', error);
                appendAlert('Registration error: user with this username already exists!', 'danger')
            });
    } else {
        appendAlert('Registration data entered incorrectly!', 'danger')
    }
});


function setUserCookies(daysToLive, fullName, username, profilePic, _id) {
    var expiresDate = new Date();
    expiresDate.setTime(expiresDate.getTime() + (daysToLive * 24 * 60 * 60 * 1000)); 
    var expires = "expires=" + expiresDate.toUTCString();

    document.cookie = "fullName=" + fullName + "; " + expires + "; path=/";
    document.cookie = "username=" + username + "; " + expires + "; path=/";
    document.cookie = "profilePic=" + profilePic + "; " + expires + "; path=/";
    document.cookie = "_id=" + _id + "; " + expires + "; path=/";
}



const appendAlert = (message, type) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = "absolute";
    wrapper.style.top = "65px";
    wrapper.style.right = "5px";
    wrapper.style.zIndex = "999999";
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('')
  
    alertPlaceholder.append(wrapper);
  
    setTimeout(() => {
        wrapper.remove();
    }, 5000);
}