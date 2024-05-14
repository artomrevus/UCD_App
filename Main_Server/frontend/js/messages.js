import {SocketContext} from '../js/header.js';


const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const conversationMessages = document.getElementById("current-conversation-messages");
const conversationsPreviews = document.getElementById("conversations-previews");
const currentConversationContainer = document.getElementById('current-conversation-container');

const createNewConversationBtn = document.getElementById('create-new-conversation-btn');
const usersPreviews = document.getElementById('users-previews');
const createConversationModalContainer = document.getElementById('create-conversation-modal-container');
const createConversationBlur = document.getElementById("create-conversation-blur");
const createNewConversationModalBtn = document.getElementById('create-new-conversation-modal-btn');
const editConversationModalBtn = document.getElementById('edit-conversation-modal-btn');
const closeCreateConversationModalBtn = document.getElementById('close-create-conversation-modal-btn');
const conversationNameInput = document.getElementById('conversation-name-input');

const alertPlaceholder = document.getElementById('liveAlertPlaceholder')


let previousConversationPreview = null;
let currentConversationId = null;
    

    fetch('/api/conversations/', {
        method: 'GET',
    } )
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    return response.json(); 
    })
    .then(data => {
        console.log('Success:', data);

        for (let i = 0; i < data.length; i++) {
            const element = data[i];
            addConversationPreview(element._id, element.name)
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });


 
    async function addMessage(message, createdAt, senderId) {
        let messageContainerClass, messageClass, profilePicClass; 
        if (senderId == getCookieValueByName('_id')) {
            messageContainerClass = "current-user-message-container";
            messageClass = "current-user-message";
            profilePicClass = "current-user-message-profile-pic";
        } else {
            messageContainerClass = "interlocutor-message-container";
            messageClass = "interlocutor-message";
            profilePicClass = "interlocutor-message-profile-pic";
        }

        await fetch('/api/users/' + senderId, {
            method: 'GET',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
            const messageContainer = document.createElement("div");
            messageContainer.className = messageContainerClass;
            conversationMessages.appendChild(messageContainer);

            const profilePic = document.createElement("img");
            profilePic.className = profilePicClass;
            profilePic.src = data.profilePic;;
            messageContainer.appendChild(profilePic);

            const messageElement = document.createElement("div");
            messageElement.className = messageClass;
            messageElement.innerText = message;
            messageContainer.appendChild(messageElement);
            var firstName = data.fullName.substring(0, data.fullName.indexOf(' '));
            messageElement.setAttribute('first-name', firstName);

            const messageTime = document.createElement("span");
            messageTime.className = "message-time";
            const currentDate = new Date(createdAt);
            messageTime.innerText = `${currentDate.getDate().toString().padStart(2, '0')}.${(currentDate.getMonth() + 1).toString().padStart(2, '0')}.${currentDate.getFullYear()} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;
            messageElement.appendChild(messageTime);


            conversationMessages.scrollTop = conversationMessages.scrollHeight;
        })
        .catch(error => {
             console.error('Error:', error);
        });
    }


    function addConversationPreview(conversationId, conversationName) {
        const conversationPreview = document.createElement("div");
        conversationPreview.className = "conversation-preview";
        conversationsPreviews.appendChild(conversationPreview);

        const conversationNameContainer = document.createElement("div");
        conversationNameContainer.className = "conversation-name-container";
        conversationNameContainer.innerText = conversationName;
        conversationPreview.appendChild(conversationNameContainer);

        const editConversationButton = document.createElement("button");
        editConversationButton.className = "edit-conversation-button";
        editConversationButton.innerText = "Edit";
        conversationPreview.appendChild(editConversationButton);

        const hiddenIdInput = document.createElement("input");
        hiddenIdInput.type = "hidden";
        hiddenIdInput.value = conversationId;
        conversationPreview.appendChild(hiddenIdInput);


        conversationPreview.addEventListener('click', () => {
            if(previousConversationPreview !== null) {
                previousConversationPreview.classList.remove('conversation-preview-selected');
            }

            currentConversationId = conversationId;
            conversationMessages.innerHTML = '';

            conversationPreview.classList.add('conversation-preview-selected');
            currentConversationContainer.style.opacity = '1';
            loadConversationMessages(currentConversationId);

            previousConversationPreview = conversationPreview;
        });


        editConversationButton.addEventListener('click', async () => {
            window.scrollTo({
                top: 0
            });
            usersPreviews.innerText = "";
            document.body.classList.add("modal-open");
            createConversationModalContainer.style.display = "block";
            createConversationBlur.style.display = "block";
            editConversationModalBtn.style.display = "block";
    

            let conversationParticipants;

            await fetch('/api/conversations/' + conversationId, {
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
                conversationNameInput.value = data.name;
                conversationParticipants = data.participants;
            })
            .catch(error => {
                console.error('Error:', error);
            });



            fetch('/api/users/', {
                method: 'GET',
            } )
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); 
            })
            .then(data => {
                console.log('Success:', data);
    
                for (let i = 0; i < data.length; i++) {
                    const element = data[i];
                    addUserPreviewToConversationModal(element._id, element.fullName, element.profilePic)
                }

                let userPreviewArr = usersPreviews.querySelectorAll('.user-preview');

                userPreviewArr.forEach(userPreview => {
                    let userId = userPreview.querySelectorAll('input')[0].value;
                    if(conversationParticipants.includes(userId))
                    {
                        userPreview.classList.add('user-preview-selected');
                    }
                });
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    }


    function removeConversationPreview(conversationId) {
        let conversationPreviewArr = conversationsPreviews.querySelectorAll('.conversation-preview');

        conversationPreviewArr.forEach(conversationPreview => {
            let previewConversationId = conversationPreview.querySelectorAll('input')[0].value;

            if(previewConversationId === conversationId)
            {
                conversationsPreviews.removeChild(conversationPreview);
                return;
            }
        });
    }


    function updateConversationName(conversationId, newConversationName) {
        let conversationPreviewArr = conversationsPreviews.querySelectorAll('.conversation-preview');

        conversationPreviewArr.forEach(conversationPreview => {
            let previewConversationId = conversationPreview.querySelectorAll('input')[0].value;

            if(previewConversationId === conversationId)
            {
                conversationPreview.querySelectorAll('.conversation-name-container')[0].innerText = newConversationName;
                return;
            }
        });
    }


   
    sendButton.addEventListener("click", function() {
        const message = messageInput.value.trim(); 
        if (message !== "") {
            addMessage(message, new Date(), getCookieValueByName('_id')); 
            messageInput.value = ""; 
        } else {
            return;
        }

        const data = {
            message : message
        };
    
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data) 
        };
  
        fetch('/api/messages/send/' + currentConversationId, options)
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
    });


    // Обробник події для натискання Enter у полі введення
    messageInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            sendButton.click(); 
        }
    });



    async function loadConversationMessages(conversationId) {
        let messages;

        await fetch('/api/conversations/' + conversationId, {
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
            messages = data.messages;
        })
        .catch(error => {
            console.error('Error:', error);
        });


        for (let i = 0; i < messages.length; i++) {
            const element = messages[i];
            await addMessage(element.message, element.createdAt, element.senderId);
        }
    }




    createNewConversationBtn.addEventListener('click', function() {
        if (!isCookieWithNameExists('_id')) {
            appendAlert(`You must be logged in to perform this action`, 'danger')
            return;
        }

        window.scrollTo({ top: 0 });
        usersPreviews.innerText = "";
        document.body.classList.add("modal-open");
        createConversationModalContainer.style.display = "block";
        createConversationBlur.style.display = "block";
        createNewConversationModalBtn.style.display = "block";

        fetch('/api/users/', {
            method: 'GET',
        } )
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
            console.log('Success:', data);

            for (let i = 0; i < data.length; i++) {
                const element = data[i];
                addUserPreviewToConversationModal(element._id, element.fullName, element.profilePic)
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    
    }); 


    closeCreateConversationModalBtn.addEventListener('click', function() {
        document.body.classList.remove("modal-open");
        createConversationModalContainer.style.display = "none";
        createConversationBlur.style.display = "none";
        createNewConversationModalBtn.style.display = "none";
        editConversationModalBtn.style.display = "none";
    });


    createNewConversationModalBtn.addEventListener('click', function() {

        if (conversationNameInput.value.length > 0) {
            let userPreviewArr = usersPreviews.querySelectorAll('.user-preview');
            let selectedUsersIds = [];

            userPreviewArr.forEach(userPreview => {
                if(userPreview.classList.contains('user-preview-selected'))
                {
                    let userId = userPreview.querySelectorAll('input')[0].value;
                    selectedUsersIds.push(userId);
                }
            });


            const data = {
                name: conversationNameInput.value,
                conversationParticipants: selectedUsersIds
            };
        
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(data) 
            };
      
            fetch('/api/conversations/', options)
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

        } else {
            return;
        }

        document.body.classList.remove("modal-open");
        createConversationModalContainer.style.display = "none";
        createConversationBlur.style.display = "none";
        createNewConversationModalBtn.style.display = "none";
        editConversationModalBtn.style.display = "none";
    }); 


    function addUserPreviewToConversationModal(userId, userFullName, userProfileImageUrl) {
        const userPreview = document.createElement("div");
        userPreview.className = "user-preview";
        usersPreviews.appendChild(userPreview);

        const userPreviewImg = document.createElement("img");
        userPreviewImg.className = "user-preview-img";
        userPreviewImg.src = userProfileImageUrl;
        userPreview.appendChild(userPreviewImg);

        const fullNameContainer = document.createElement("div");
        fullNameContainer.className = "user-full-name-container";
        fullNameContainer.innerText = userFullName;
        userPreview.appendChild(fullNameContainer);

        const hiddenIdInput = document.createElement("input");
        hiddenIdInput.type = "hidden";
        hiddenIdInput.value = userId;
        userPreview.appendChild(hiddenIdInput);

        userPreview.addEventListener('click', () => {
            if(userPreview.classList.contains('user-preview-selected')) {
                userPreview.classList.remove('user-preview-selected');
            } else {
                userPreview.classList.add('user-preview-selected');
            }
        });
    }
    

    editConversationModalBtn.addEventListener('click', function() {
        if (conversationNameInput.value.length > 0) {
            let userPreviewArr = usersPreviews.querySelectorAll('.user-preview');
            let selectedUsersIds = [];

            userPreviewArr.forEach(userPreview => {
                if(userPreview.classList.contains('user-preview-selected'))
                {
                    let userId = userPreview.querySelectorAll('input')[0].value;
                    selectedUsersIds.push(userId);
                }
            });


            const data = {
                name: conversationNameInput.value,
                conversationParticipants: selectedUsersIds
            };
        
            const options = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(data) 
            };
      
            fetch('/api/conversations/' + currentConversationId, options)
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

        } else {
            return;
        }

        document.body.classList.remove("modal-open");
        createConversationModalContainer.style.display = "none";
        createConversationBlur.style.display = "none";
        createNewConversationModalBtn.style.display = "none";
        editConversationModalBtn.style.display = "none";
    });






    // SOCKET IO: 



    const listenSocketMessagesEvents = () => {
        SocketContext.socket?.on("newMessage", (newMessage) => {
            if(currentConversationId == newMessage.conversationId && newMessage.senderId != getCookieValueByName('_id')) {
                addMessage(newMessage.message, newMessage.createdAt, newMessage.senderId);
                console.log("New conversation message received")
            } 
        });

        SocketContext.socket?.on("newConversation", (conversation) => {
            addConversationPreview(conversation._id, conversation.name);
            console.log("New conversation added")
            appendAlert(`New conversation with name "${conversation.name}" created`, 'success')
        });

        SocketContext.socket?.on("addedToConversation", (conversation) => {
            addConversationPreview(conversation._id, conversation.name);
            console.log(`Current user have been added to ${conversation.name} conversation`)
            appendAlert(`You have been added to "${conversation.name}" conversation`, 'success')
        });

        SocketContext.socket?.on("removedFromConversation", (conversation) => {
            removeConversationPreview(conversation._id);
            console.log(`Current user have been kicked from ${conversation.name} conversation`)
            appendAlert(`You have been removed from "${conversation.name}" conversation`, 'danger')
        });

        SocketContext.socket?.on("conversationNameChanged", (conversation, oldConversationName) => {
            updateConversationName(conversation._id, conversation.name);
            console.log(`Conversation name changed from "${oldConversationName}" to "${conversation.name}"`)
            appendAlert(`Conversation name changed from "${oldConversationName}" to "${conversation.name}"`, 'success')
        });

        
    };

    if(isCookieWithNameExists("_id")) {
        listenSocketMessagesEvents();
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