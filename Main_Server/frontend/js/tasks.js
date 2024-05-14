import {SocketContext} from '../js/header.js';


const containers = document.querySelectorAll(".todo-list-container");
const addTaskFormBlur = document.getElementById("add-task-form-blur");
const addTaskForm = document.getElementById("add-task-form");
const closeAddTaskFormBtn = document.getElementById("close-add-task-form-btn");
const taskNameInput = document.getElementById("task-name-input");
const addTaskBtn = document.getElementById("add-task-btn");
const addTaskFormBtn = document.getElementById("add-task-form-btn");

const toDoBoard = document.getElementById("to-do-board");
const inProgressBoard = document.getElementById("in-progress-board");
const doneBoard = document.getElementById("done-board");

const alertPlaceholder = document.getElementById('liveAlertPlaceholder')




window.addEventListener('load', function(event) 
{
    sendTasksReviewedReq();
    loadAllTasks();
});


addTaskBtn.addEventListener("click", function (e) {
  addTaskFormBlur.style.display = "block";
  addTaskForm.style.display = "block";
  taskNameInput.value = ""
});


addTaskFormBtn.addEventListener("click", async function (e) {

  if(taskNameInput.value.length < 1) {
    const prevBorder = taskNameInput.style.border;
    taskNameInput.style.border = "2px solid red";

    setTimeout(() => {
      taskNameInput.style.border = prevBorder;
    }, 1000);

    return;
  }

  const data = {
    boardName: "toDo",
    header: taskNameInput.value,
    description: "", 
    date: ""
  };

  const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json' 
    },
    body: JSON.stringify(data) 
  };


  let taskId;

  await fetch('/api/tasks/', options)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(data => {
        console.log('Success:', data);
        taskId = data._id;
    })
    .catch(error => {
        console.error('Error:', error);
    });


  addTaskFormBlur.style.display = "none";
  addTaskForm.style.display = "none";

  addNewTaskUI(taskId, toDoBoard, taskNameInput.value, "", "");
});


function addNewTaskUI(taskId, tasksBoard, taskName, taskDescription, taskDeadlineDate) {
  const taskContainer = document.createElement("div");
  taskContainer.classList.add("task-container");

  const headerArea = document.createElement("textarea");
  headerArea.classList.add("task-header");
  headerArea.placeholder = "Task name";
  headerArea.value = taskName;
  taskContainer.appendChild(headerArea);
  
  const descriptionArea = document.createElement("textarea");
  descriptionArea.classList.add("task-textarea");
  descriptionArea.placeholder = "Task description";
  descriptionArea.value = taskDescription;
  taskContainer.appendChild(descriptionArea)

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.valueAsDate = taskDeadlineDate === null ? null : new Date(taskDeadlineDate);
  taskContainer.appendChild(dateInput)

  const btnsContainer = document.createElement("div");
  btnsContainer.classList.add("task-buttons-container");
  taskContainer.appendChild(btnsContainer);

  const saveBtn = document.createElement("div");
  saveBtn.classList.add("task-save-button");
  btnsContainer.appendChild(saveBtn);

  const deleteBtn = document.createElement("div");
  deleteBtn.classList.add("task-delete-button");
  btnsContainer.appendChild(deleteBtn);


  taskContainer.draggable = true;
  taskContainer.id = taskId; // replace by post req res (created task ObjectId)
  
  taskContainer.addEventListener("dragstart", onDragStart);
  taskContainer.addEventListener("dragend", onDragEnd);

  tasksBoard.appendChild(taskContainer);


  saveBtn.addEventListener('click', () => {
    const newBoard = document.getElementById(taskId).parentNode;

    let boardNameText;
    if(newBoard.id === "to-do-board") {
      boardNameText = "toDo";
    } else if (newBoard.id === "in-progress-board") {
      boardNameText = "inProgress";
    } else if (newBoard.id === "done-board") {
      boardNameText = "done";
    } else {
      return;
    }

    const data = {
      boardName: boardNameText, 
      header: headerArea.value, 
      description: descriptionArea.value, 
      date: dateInput.value
    };

    const options = {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json' 
      },
      body: JSON.stringify(data) 
    };

    fetch(`/api/tasks/${taskId}`, options)
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json(); 
      })
      .then(data => {
          console.log(`Success (/api/tasks/${taskId}):`, data);
          appendAlert("Task saved successfully", "success");
      })
      .catch(error => {
          console.error('Error:', error);
      });


    saveBtn.style.display = "none";
  });


  deleteBtn.addEventListener('click', () => {
    if(saveBtn.style.display === "block") {
      appendAlert("Save your changes before deleting", "danger");
      return;
    }

    fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    })
    .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }

      console.log(`Success (/api/tasks/${taskId}):`);

      let taskContainer = document.getElementById(taskId);
      taskContainer.parentNode.removeChild(taskContainer);
  
      appendAlert("Task removed successfully", "success");
    })
    .catch(error => {
      console.error('Error:', error);
      appendAlert("Error occured", "danger");
    });
  });


  headerArea.addEventListener("input", () => {
    saveBtn.style.display = "block";
  });

  descriptionArea.addEventListener("input", () => {
    saveBtn.style.display = "block";
  });

  dateInput.addEventListener("input", () => {
    saveBtn.style.display = "block";
  });
}


function onDragStart(e) {
  e.dataTransfer.setData("task", e.target.id);
  e.target.classList.add("drag");
}

function onDragEnd(e) {
  e.target.classList.remove("drag");
}


containers.forEach((container) => {
  container.addEventListener("dragover", function (e) {
    e.preventDefault();
  });
});


containers.forEach((container) => {
  container.addEventListener("drop", function (e) {
    e.preventDefault();
    const taskID = e.dataTransfer.getData("task");
    e.target.appendChild(document.getElementById(taskID));
    document.getElementById(taskID).getElementsByClassName("task-save-button")[0].style.display = "block";
  });
});


closeAddTaskFormBtn.addEventListener('click', () => {
  addTaskFormBlur.style.display = "none";
  addTaskForm.style.display = "none";
});


function sendTasksReviewedReq() {
  const options = {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json' 
    },
  };

  fetch('/api/users/tasksreviewed/', options)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(data => {
        console.log('Success (/api/users/tasksreviewed/):', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function loadAllTasks() {
  fetch('/api/tasks/', {
    method: 'GET',
  } )
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); 
  })
  .then(data => {
    console.log('Success (/api/tasks/):', data);

    data.forEach(task => {
      let tasksBoard = getBoardByName(task.boardName);
      if (tasksBoard === null) {
        return;
      }

      addNewTaskUI(task._id, tasksBoard, task.header, task.description, task.date);
    })
  })
  .catch(error => {
      console.error('Error:', error);
  });
}



// SOCKET IO:


const listenSocketTasksEvents = () => {
  SocketContext.socket?.on("newTask", (newTask) => {

    sendTasksReviewedReq();

    let tasksBoard = getBoardByName(newTask.boardName);
    if (tasksBoard === null) {
      return;
    }

    addNewTaskUI(newTask._id, tasksBoard, newTask.header, newTask.description, newTask.date);
  });

  SocketContext.socket?.on("deletedTask", (deletedTask) => {  
    let tasksBoard = getBoardByName(deletedTask.boardName);
    if (tasksBoard === null) {
      return;
    }

    tasksBoard.removeChild(document.getElementById(deletedTask._id));
  });

  SocketContext.socket?.on("updatedTask", (updatedTask) => {
    let tasksBoard = getBoardByName(updatedTask.boardName);
    if (tasksBoard === null) {
      return;
    }

    const updatedTaskContainer = document.getElementById(updatedTask._id);

    if(updatedTaskContainer.parentNode.id !== tasksBoard.id) {
      updatedTaskContainer.parentNode.removeChild(updatedTaskContainer);
      tasksBoard.appendChild(updatedTaskContainer);
    }

    const headerArea = updatedTaskContainer.getElementsByClassName("task-header")[0];
    headerArea.value = updatedTask.header;
    
    const descriptionArea = updatedTaskContainer.getElementsByClassName("task-textarea")[0];
    descriptionArea.value = updatedTask.description;

    const dateInput = updatedTaskContainer.getElementsByTagName("input")[0];
    dateInput.valueAsDate = updatedTask.date === null ? null : new Date(updatedTask.date);
  });
};

if(isCookieWithNameExists("_id")) {
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


function getBoardByName(name) {
  const toDoBoard = document.getElementById("to-do-board");
  const inProgressBoard = document.getElementById("in-progress-board");
  const doneBoard = document.getElementById("done-board");

  let tasksBoard;
  if(name === "toDo") {
    tasksBoard = toDoBoard;
  } else if (name === "inProgress") {
    tasksBoard = inProgressBoard;
  } else if (name === "done") {
    tasksBoard = doneBoard;
  } else {
    return null;
  }

  return tasksBoard;
}