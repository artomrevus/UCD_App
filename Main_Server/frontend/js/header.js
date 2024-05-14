const currPageUrl = window.location.href;

const currentUserName = document.getElementById('current-user-name');
const userIconImg = document.getElementById('user-icon-img');
const userIconMenu = document.getElementById('user-icon-menu');
const logOutLink = document.getElementById('log-out-link');
const notificationsList = document.getElementById('notifications-list');

const blinkingCircle = document.getElementById('blinking-circle')


window.addEventListener('load', function(event) 
{
    setCurrentUserDataFromCookies();
    loadUnreviewedTasks();
});






logOutLink.addEventListener('click', () => {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
    };

    fetch('/api/auth/logout/', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });

    deleteUserCookies();
    window.location.reload();
});


function setCurrentUserDataFromCookies() {
    if(isCookieWithNameExists('fullName') && isCookieWithNameExists('profilePic') ) {
        currentUserName.innerText = getCookieValueByName('fullName');
        userIconImg.style.backgroundImage = 'url(' + getCookieValueByName('profilePic') + ')';
        userIconMenu.classList.remove('user-icon-menu-unregistered');
        userIconMenu.classList.add('user-icon-menu-registered');
    }
}


function deleteUserCookies() {
    deleteCookieByName('fullName');
    deleteCookieByName('username');
    deleteCookieByName('profilePic');
    deleteCookieByName('_id');
}


function deleteCookieByName(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}


function loadUnreviewedTasks() {
    if(!isCookieWithNameExists('_id') || 'tasks.html' === currPageUrl.substring(currPageUrl.lastIndexOf('/') + 1)) {
        return;
    }

    fetch('/api/users/' + getCookieValueByName('_id'), {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(data => {
        console.log('Success:', data);

        if(data.newTasks.length > 0) {
            blinkingCircle.style.display = "block";
            notificationsList.innerText = "";
            data.newTasks.forEach(task => {
                const taskNotification = document.createElement("div");
                taskNotification.className = "new-task-notification";
                taskNotification.innerText = `New task: "${task.header}"`;
                notificationsList.appendChild(taskNotification);
            });
        } else {
            blinkingCircle.style.display = "none";
            notificationsList.innerText = "";
            const noMessages = document.createElement("div");
            noMessages.className = "no-messages";
            noMessages.innerText = "No new messages yet";
            notificationsList.appendChild(noMessages);
        }
    })
    .catch(error => {
         console.error('Error:', error);
    });
}



// SOCKET IO:


export const SocketContext = {
    socket: null,
    onlineUsers: [],
    setSocket(socket) {
        this.socket = socket;
    },
    setOnlineUsers(users) {
        this.onlineUsers = users;
    },
};


const connectSocket = (userId) => {
    const socket = io("/", {
        query: {
            userId: userId,
        },
    });

    socket.on("getOnlineUsers", (users) => {
        SocketContext.setOnlineUsers(users);
    });

    SocketContext.setSocket(socket);
};


const listenSocketTasksEvents = () => {
    SocketContext.socket?.on("newTask", (newTask) => {
        if('tasks.html' !== currPageUrl.substring(currPageUrl.lastIndexOf('/') + 1)) {
            loadUnreviewedTasks();
        }
    });

    SocketContext.socket?.on("deletedTask", (deletedTask) => {  
        if('tasks.html' !== currPageUrl.substring(currPageUrl.lastIndexOf('/') + 1)) {
            loadUnreviewedTasks();
        }
    });

    SocketContext.socket?.on("updatedTask", (updatedTask) => {  
        if('tasks.html' !== currPageUrl.substring(currPageUrl.lastIndexOf('/') + 1)) {
            loadUnreviewedTasks();
        }
    });
};


if(isCookieWithNameExists("_id")) {
    connectSocket(getCookieValueByName('_id'));
    listenSocketTasksEvents();
}



function isCookieWithNameExists(cookieName) {
    var cookiesArray = document.cookie.split(';');

    for(var i = 0; i < cookiesArray.length; i++) {
        var cookie = cookiesArray[i].trim();
        if (cookie.indexOf(cookieName + '=') === 0) {
            return true;
        }
    }

    return false;
}

function getCookieValueByName(cookieName) {
    var cookiesArray = document.cookie.split(';');

    for (var i = 0; i < cookiesArray.length; i++) {
        var cookie = cookiesArray[i].trim();
        if (cookie.indexOf(cookieName + '=') === 0) {
            return cookie.substring((cookieName + '=').length, cookie.length);
        }
    }
}


