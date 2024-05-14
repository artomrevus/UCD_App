// Main objects: 
const addEditForm = document.querySelector('#add-edit-students-form');
const addEditFormBlur = document.querySelector("#add-edit-students-form-blur");

const idInputField = document.querySelector('#itemId');
const groupInputField = document.querySelector('#inputGroup');
const firstNameInputField = document.querySelector('#inputFirstName');
const lastNameInputField = document.querySelector('#inputLastName');
const genderInputField = document.querySelector('#inputGender');
const birthdayInputField = document.querySelector('#inputBirthday');

const groupValidationFeedbackContainer = document.querySelector('#validation-inputGroup-feedback');
const firstNameValidationFeedbackContainer = document.querySelector('#validation-inputFirstName-feedback');
const lastNameValidationFeedbackContainer = document.querySelector('#validation-inputLastName-feedback');
const genderValidationFeedbackContainer = document.querySelector('#validation-inputGender-feedback');
const birthdayValidationFeedbackContainer = document.querySelector('#validation-inputBirthday-feedback');

const deleteStudentTableRowModal = document.querySelector('#delete-students-table-row-modal');


const UCD_SERVER_URL = "http://localhost:5220/";




// ---------------------------------------------------------------------------------------------------------------------
// On window load







window.addEventListener('load', function(event) 
{
    getAllStudentServerRequest
    (
        UCD_SERVER_URL + 'Students/GetAllStudents', 
        function(responseText)
        {
            let responseObject = JSON.parse(responseText);

            if(responseObject.Status === true)
            {
                let allStudentsArray = responseObject.Object;
                allStudentsArray.forEach(student => {
                    addNewStudentsTableRow(
                        student.Id, 
                        student.Group, 
                        student.FirstName + ' ' + student.LastName, 
                        student.Gender, 
                        reformatDate(student.Birthday)
                    );
                });
            }
        }
    );
});






// ---------------------------------------------------------------------------------------------------------------------
// Close form functions




document.querySelector('#close-add-edit-student-form-button').addEventListener('click', function ()
{
    resetValidationStylesForAddEditForm();
    addEditForm.reset();
    hideAddEditForm();
})


document.querySelector('#cancel-add-edit-student-form-button').addEventListener('click', function ()
{
    resetValidationStylesForAddEditForm();
    addEditForm.reset();
    hideAddEditForm();
})





// ---------------------------------------------------------------------------------------------------------------------
// Delete table row functions





let tableRowForDeleting;
function deleteTableRowButtonClicked(deleteButton)
{
    tableRowForDeleting = deleteButton.parentNode.parentNode;
    const name = tableRowForDeleting.children[2].innerHTML;

    showDeleteRowModal('Are you sure you want to delete user ' + name + '?');
}


document.querySelector('#delete-row-modal-ok-button').addEventListener('click', function () 
{
    deleteStudentServerRequest
    (
        UCD_SERVER_URL + 'Students/DeleteStudent', 
        tableRowForDeleting.getAttribute('data-id'),
        function(responseText)
        {
            let responseObject = JSON.parse(responseText);

            if(responseObject.Status === true)
            {
                tableRowForDeleting.parentNode.removeChild(tableRowForDeleting);
                hideDeleteRowModal();
            }
        }
    );
});





// ---------------------------------------------------------------------------------------------------------------------
// Add student functions





// Adding new student to table
document.querySelector('#addStudentButton').addEventListener('click', function()
{
    document.querySelector('#save-student-button').hidden = true;
    document.querySelector('#create-student-button').hidden = false;
    document.querySelector('#add-edit-form-header-text').innerText = "Add student";
    showAddEditForm();
});


document.querySelector('#create-student-button').addEventListener('click', function (event)
{
    event.preventDefault();

    addNewStudentServerRequest
    (
        UCD_SERVER_URL + 'Students/AddStudent', 
        groupInputField.value,
        firstNameInputField.value, 
        lastNameInputField.value,
        genderInputField.value, 
        birthdayInputField.value, 
        function(responseText) 
        {
            let responseObject = JSON.parse(responseText);

            if(responseObject.Status === false)
            {
                let fieldsArray = [groupInputField, firstNameInputField, lastNameInputField, genderInputField, birthdayInputField];
                let validationFeedbacksArray = [groupValidationFeedbackContainer, firstNameValidationFeedbackContainer, lastNameValidationFeedbackContainer,
                    genderValidationFeedbackContainer, birthdayValidationFeedbackContainer];

                let errorsArray = responseObject.ErrorObject.message.split("&&");

                for(let i = 0; i < 5; ++i)
                {
                    if(errorsArray[i] === "")
                    {
                        setFieldValidStyles(fieldsArray[i], validationFeedbacksArray[i]);
                    }
                    else
                    {
                        setFieldInvalidStyles(fieldsArray[i], validationFeedbacksArray[i], errorsArray[i]);
                    }
                }
            }
            else
            {
                addNewStudentsTableRow(responseObject.Object.Id , responseObject.Object.Group,responseObject.Object.FirstName + ' ' + responseObject.Object.LastName,
                    responseObject.Object.Gender, reformatDate(responseObject.Object.Birthday));
                
                resetValidationStylesForAddEditForm();
                document.querySelector('#add-edit-students-form').reset();
                hideAddEditForm();
            }

        }
    );

});


function addNewStudentsTableRow(id, group, name, gender, birthday)
{
    const tbody = document.querySelector('#students-table-body');

    let newRow = tbody.insertRow();

    newRow.className = "tableRow";
    newRow.setAttribute('data-id', id);

    let checkboxCell = newRow.insertCell(0);
    let groupCell = newRow.insertCell(1);
    let nameCell = newRow.insertCell(2);
    let genderCell = newRow.insertCell(3);
    let birthdayCell = newRow.insertCell(4);
    let statusCell = newRow.insertCell(5);
    let optionsCell = newRow.insertCell(6);

    checkboxCell.innerHTML = "<input type=\"checkbox\" class='studentTableRowCheckbox'>";
    groupCell.innerHTML = group;
    nameCell.innerHTML = name;
    genderCell.innerHTML = gender;
    birthdayCell.innerHTML = birthday;


    // Student status (online/offline) | Students table
    const statusCircle = document.createElement('div');
    statusCircle.className = "statusCircleOnline";
    // statusCircle.className = "statusCircleOffline";
    statusCell.appendChild(statusCircle);


    // Edit student button | Students table
    const editButton = document.createElement('button');
    editButton.className = "editOptionButton";
    editButton.onclick = function() {
        editStudentButtonClicked(this);
    };
    optionsCell.appendChild(editButton);


    // Delete student button | Students table
    const deleteButton = document.createElement('button');
    deleteButton.className = "deleteOptionButton";
    deleteButton.onclick = function() {
        deleteTableRowButtonClicked(this);
    };
    optionsCell.appendChild(deleteButton);
}






// ---------------------------------------------------------------------------------------------------------------------
// Edit student functions





// Editing student
let tableRowForEditing;
function editStudentButtonClicked(editButton)
{
    document.querySelector('#create-student-button').hidden = true;
    document.querySelector('#save-student-button').hidden = false;
    document.querySelector('#add-edit-form-header-text').innerText = "Edit student";
    showAddEditForm();

    tableRowForEditing = editButton.parentNode.parentNode;
    fillAddEditFormWithRowData(tableRowForEditing);
}


document.querySelector('#save-student-button').addEventListener('click', function (event)
{
    event.preventDefault();

    editStudentServerRequest
    (
        UCD_SERVER_URL + 'Students/EditStudent',
        tableRowForEditing.getAttribute('data-id'),
        groupInputField.value,
        firstNameInputField.value, 
        lastNameInputField.value, 
        genderInputField.value, 
        birthdayInputField.value, 
        function(responseText)
        {
            let responseObject = JSON.parse(responseText);

            if(responseObject.Status === false)
            {
                let fieldsArray = [groupInputField, firstNameInputField, lastNameInputField, genderInputField, birthdayInputField];
                let validationFeedbacksArray = [groupValidationFeedbackContainer, firstNameValidationFeedbackContainer, lastNameValidationFeedbackContainer,
                    genderValidationFeedbackContainer, birthdayValidationFeedbackContainer ];

                let errorsArray = responseObject.ErrorObject.message.split("&&");

                for(let i = 0; i < 5; ++i)
                {
                    if(errorsArray[i] === "")
                    {
                        setFieldValidStyles(fieldsArray[i], validationFeedbacksArray[i]);
                    }
                    else
                    {
                        setFieldInvalidStyles(fieldsArray[i], validationFeedbacksArray[i], errorsArray[i]);
                    }
                }
            }
            else
            {
                editStudentsTableRow(tableRowForEditing, responseObject.Object.Group, responseObject.Object.FirstName + ' ' + responseObject.Object.LastName,
                    responseObject.Object.Gender, reformatDate(responseObject.Object.Birthday));
        
                resetValidationStylesForAddEditForm();
                document.querySelector('#add-edit-students-form').reset();
                hideAddEditForm();
            }

        }
    );
})


function fillAddEditFormWithRowData(tableRow)
{
    let cells = tableRow.querySelectorAll('td');

    groupInputField.value = cells[1].innerHTML;
    let fullName = cells[2].innerHTML.trim().split(" ");
    firstNameInputField.value = fullName[0];
    lastNameInputField.value = fullName[1];
    genderInputField.value = cells[3].innerHTML;

    let birthdayDate = new Date();
    let splitBirthday = cells[4].innerHTML.split(".");
    birthdayDate.setFullYear(Number(splitBirthday[2]), Number(splitBirthday[1]) - 1, Number(splitBirthday[0]));
    birthdayInputField.value = birthdayDate.toISOString().split('T')[0];
}


function editStudentsTableRow(rowForEditing, group, name, gender, birthday)
{
    let cells = rowForEditing.querySelectorAll('td');

    cells[1].innerHTML = group;
    cells[2].innerHTML = name;
    cells[3].innerHTML = gender;
    cells[4].innerHTML = birthday;
}





// ---------------------------------------------------------------------------------------------------------------------
// Server communication functions





/**
 * @param {string} requestUrl
 * @param {string} group - group field value
 * @param {string} firstName - firstName field value
 * @param {string} lastName - lastName field value
 * @param {string} gender - gender field value
 * @param {string} birthday - birthday field value
 * @param {function(string): void} actionAfterResponse - function,  which receives a response from the server as a parameter "responseText (string)" and performs actions on it
 * @returns {void}
*/
function addNewStudentServerRequest(requestUrl, group, firstName, lastName, gender, birthday, actionAfterResponse)
{
    const data = {
        Group: group,
        FirstName: firstName,
        LastName: lastName,
        Gender: gender,
        Birthday: birthday
    };
    console.log("POST request data: \n\n", data);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", requestUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success.\n\nResponse text:\n\n', xhr.responseText);
                actionAfterResponse(xhr.responseText);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    xhr.send(JSON.stringify(data));

    console.log("POST add student request sent to:", requestUrl);
}


/**
 * @param {string} requestUrl
 * @param {number} id - student id
 * @param {string} group - group field value
 * @param {string} firstName - firstName field value
 * @param {string} lastName - lastName field value
 * @param {string} gender - gender field value
 * @param {string} birthday - birthday field value
 * @param {function(string): void} actionAfterResponse - function,  which receives a response from the server as a parameter "responseText (string)" and performs actions on it
 * @returns {void}
*/
function editStudentServerRequest(requestUrl, id, group, firstName, lastName, gender, birthday, actionAfterResponse)
{
    const data = {
        Id: id,
        Group: group,
        FirstName: firstName,
        LastName: lastName,
        Gender: gender,
        Birthday: birthday
    };
    console.log("POST request data: \n\n", data);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", requestUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success.\n\nResponse text:\n\n', xhr.responseText);
                actionAfterResponse(xhr.responseText);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    xhr.send(JSON.stringify(data));

    console.log("POST edit student request sent to:", requestUrl);
}


/**
 * @param {string} requestUrl
 * @param {function(string): void} actionAfterResponse - function,  which receives a response from the server as a parameter "responseText (string)" and performs actions on it
 * @returns {void}
*/
function getAllStudentServerRequest(requestUrl, actionAfterResponse)
{
    const xhr = new XMLHttpRequest();
    xhr.open("GET", requestUrl, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success.\n\nResponse text:\n\n', xhr.responseText);
                actionAfterResponse(xhr.responseText);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    xhr.send();

    console.log("GET all student request sent to:", requestUrl);
}


/**
 * @param {string} requestUrl
 * @param {number} studentId - student id
 * @param {function(string): void} actionAfterResponse - function,  which receives a response from the server as a parameter "responseText (string)" and performs actions on it
 * @returns {void}
*/
function deleteStudentServerRequest(requestUrl, studentId,  actionAfterResponse)
{
    const xhr = new XMLHttpRequest();
    const url = `${requestUrl}/${studentId}`; // Додаємо studentId до URL-адреси

    xhr.open("DELETE", url, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                console.log('Success.\n\nResponse text:\n\n', xhr.responseText);
                actionAfterResponse(xhr.responseText);
            } else {
                console.error('Error:', xhr.responseText);
            }
        }
    };

    xhr.send();

    console.log("DELETE student request sent to:", url);
}







// ---------------------------------------------------------------------------------------------------------------------
// Checkbox functions




document.querySelector('#headerCheckbox').addEventListener('click', function()
{
    const tbody = document.querySelector('#students-table-body');
    const tableRows = tbody.querySelectorAll('tr');

    for(let i = 0; i < tableRows.length; ++i)
    {
        let currentCheckbox = tableRows[i].querySelectorAll('td')[0].querySelectorAll('.studentTableRowCheckbox')[0];
        currentCheckbox.checked = this.checked;
    }
});





// ---------------------------------------------------------------------------------------------------------------------
// Hiding / showing windows functions




function showDeleteRowModal(bodyText)
{
    const deleteModalBodyParagraph = document.querySelector('#delete-row-modal-body-paragraph');
    deleteModalBodyParagraph.textContent = bodyText;

    let modal = new bootstrap.Modal(deleteStudentTableRowModal);
    modal.show();
}


function hideDeleteRowModal() 
{
    let modal = bootstrap.Modal.getInstance(deleteStudentTableRowModal);
    modal.hide();
}


function showAddEditForm()
{
    addEditForm.style.display = "flex";
    addEditFormBlur.style.display = "block";
}


function hideAddEditForm()
{
    addEditForm.style.display = "none";
    addEditFormBlur.style.display = "none";
}





// ---------------------------------------------------------------------------------------------------------------------
// Validation styles




function setFieldInvalidStyles(field, fieldFeedbackContainer, errorText)
{
    field.classList.remove("is-valid");
    field.classList.add("is-invalid");

    fieldFeedbackContainer.innerText = errorText;
    fieldFeedbackContainer.classList.remove("valid-feedback");
    fieldFeedbackContainer.classList.add("invalid-feedback");
}


function setFieldValidStyles(field, fieldFeedbackContainer)
{
    field.classList.remove("is-invalid");
    field.classList.add("is-valid");

    fieldFeedbackContainer.innerText = "";
    fieldFeedbackContainer.classList.remove("invalid-feedback");
    fieldFeedbackContainer.classList.add("valid-feedback");
}


function resetValidationStylesForAddEditForm()
{
    let addEditFormFields = [groupInputField, firstNameInputField, lastNameInputField, genderInputField, birthdayInputField];

    for(let i = 0; i < addEditFormFields.length; ++i)
    {
        addEditFormFields[i].classList.remove("is-valid");
        addEditFormFields[i].classList.remove("is-invalid");
    }

    let feedbackContainers = [groupValidationFeedbackContainer, firstNameValidationFeedbackContainer, lastNameValidationFeedbackContainer,
        genderValidationFeedbackContainer, birthdayValidationFeedbackContainer];

    for(let i = 0; i < feedbackContainers.length; ++i)
    {
        feedbackContainers[i].classList.remove("valid-feedback");
        feedbackContainers[i].classList.remove("invalid-feedback");
        feedbackContainers[i].innerText = "";
    }
}




// ---------------------------------------------------------------------------------------------------------------------
// Other (additional) functions




function reformatDate(date)
{
    let dateParts = date.split('-');
    return dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0];
}
