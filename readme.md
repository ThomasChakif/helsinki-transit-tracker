# CSE264 Final Project: Helsinki Transit Tracker
## Members: Thomas Chakif - thc225@lehigh.edu, Lauri Soome - las623@lehigh.edu, Aiden Astle - apa225@lehigh.edu

### Project Specifications
* User Accounts & Roles: there are 3 different roles for this project: users, authorized users, and admins. Users can view the vehicle map and view the 5 most recent votes for a particular station or vehicle, authorized users can do the same as well as make a new report on a vehicle or station, and admins have access to an admin dashboard (/admin) that display statistics about recent reports as well as a table of all reports. Admins can delete any reports. Users are authorized using Google OAuth through Firebase.
* Database: in this project we use a postgres database with one table 'reports' which holds the following information regarding inspector reports: 
(`<br>`)
![Database table](https://github.com/cse264/finalproject-fullstack-ThomasChakif/blob/main/img/table.png)
![Database table columns](https://github.com/cse264/finalproject-fullstack-ThomasChakif/blob/main/img/tableColumns.png)
* Interactive UI: Your web app must have an interactive user interface, which can include forms, real-time updates, animations, or other dynamic elements.
* New Library or Framework: You must use at least one library or framework that was not covered in class.
* Internal REST API: Your project must have an API layer used to store and retrieve data
* External REST API: You may include an external REST API (e.g., Reddit API, Spotify API, OpenWeather API, etc.).


### Installation and Running the Project

#### Client
The client for this project uses React + Vite template which provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

You must have node.js running on your machine. Once you have cloned this project you can run `npm install` to install all the packages for this project. Then running `npm run dev` will run the dev version of this code, which will run this project on localhost:5173 (or at the location specified in the console).

#### Server
You must have node.js running on your machine. Once you have cloned this project you can run `npm install` to install all the packages for this project. Then running `npm run dev` will run the dev version of this code, which will run this project with nodemon. Nodemon auto-restarts the node server every time you make a change to a file. This is very helpful when you are writing and testing code.
