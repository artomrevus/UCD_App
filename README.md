# UCD App

## Name
UCD Web Application

## Description
A website for collaborative work with your colleagues. The following features are currently available: 
- Accounts: You can create your own accounts and log in/out of them.
- Chats: create and edit chats and chat; all your messages will be saved and you can read them at any time; everything works without the need for any reboots, your messages come interactively. 
- Task scheduling: the site has its own task scheduler, you can create, edit, delete tasks and all this will be displayed to your colleagues interactively, when you create tasks, everyone will receive notifications about a new task.
- Student management: you can edit the student table, performing all crud the necessary actions (adding, editing, deleting, all students are uploaded to your colleagues and saved for work on the table in the future).

## Installation and launch

1. **To begin with, download the app:** 
    - If you have git installed: 
        - Open the terminal in the folder where you want to download the project.
        - Enter the command: 
            ```bash
            git clone https://github.com/artomrevus/UCD_App.git
    - If you don't have git installed: 
        - Install the application as a zip archive and unzip it

2. **Download the required packages:**
    - Install **dotnet 8.0** and **node js** (npm) if you don't already have it.
    - Open terminal in the root directory of the downloaded application (UCD_App).
    - Install **node js packages**. To do it - enter the commands: 
            ```bash
            cd Main_Server
            npm install bcryptjs cookie-parser cors dotenv express jsonwebtoken mongoose socket.io
            npm install nodemon --save-dev
    - Open terminal in the root directory of the downloaded application (UCD_App).
    - Install **.Net packages**. To do it - enter the commands: 
            ```bash
            cd Students_Server
            cd Students_Server
            dotnet add package Microsoft.EntityFrameworkCore.Design--version 8.0.4
            dotnet add package Microsoft.EntityFrameworkCore.SqlServer --version 8.0.4
            dotnet add package Microsoft.EntityFrameworkCore.Tools --version 8.0.4
            dotnet add package Pomelo.EntityFrameworkCore.MySql --version 8.0.2

2. **Set up your environment files:**
    - Configure the **.env file** (path: UCD_App/Main_Server/.env): set the values for MONGO_DB_URI and JWT_SECRET.
    - Configure the **appsettings.json file** (path: UCD_App/Main_Server/.env): change "UCD_Server_DB" connection string value to your DB data.

3. **DataBases creating & settings:**
    - Create your MongoDB (you can do this here: https://www.mongodb.com/). When you create the database, get the MONGO_DB_URI and paste it into the .env as described in the previous step (step #2).
    - Create your MySql DB (you can do this with MySqlWorkbench). When you create the database, get the "UCD_Server_DB" connection string and paste it into the appsettings.json as described in the previous step (step #2).
    - Migrations for MySql DB: 
        - Open terminal in the root directory of the downloaded application (UCD_App).
        - Enter the commands: 
            ```bash
            cd Students_Server
            cd Students_Server
            dotnet tool install --global dotnet-ef --version 8.0.4
            dotnet ef database update       

4. **Launching the web app:**
    - Launching servers: 
        - Launch Students_Server:
             - Open terminal in the root directory of the downloaded application (UCD_App).
             - Enter the commands: 
                ```bash
                cd Students_Server
                cd Students_Server     
                dotnet run --urls=http://localhost:5002
        - Launch Main_Server:
             - Open terminal in the root directory of the downloaded application (UCD_App).
             - Enter the commands: 
                ```bash
                cd Main_Server   
                npm run server
    - Launching the web app:
        - Students page: http://localhost:5001/html/students.html
        - Tasks page: http://localhost:5001/html/tasks.html
        - Messages page: http://localhost:5001/html/messages.html
        P.S. You can navigate throught pages by clicking UCD logo (left side of the header). 

## Technologies
Here I program a website using:
- HTML
- CSS
- JavaScript
- С#
- Bootstrap
- PWA
- Asp.Net Core Web Api
- Entity Framework
- Node.js
- Express.js
- Mongoose
- MongoDB
- MySql
- Socket.io

## Support
Telegram: [artomrevus](https://t.me/artomrevus)

## Authors and acknowledgment
Telegram: [artomrevus](https://t.me/artomrevus)
