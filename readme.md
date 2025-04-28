# CSE264 Final Project: Helsinki Transit Tracker
## Members: Thomas Chakif - thc225@lehigh.edu, Lauri Soome - las623@lehigh.edu, Aiden Astle - apa225@lehigh.edu

### Project Description
* Our Helsinki Transit Tracker is a React-based web app designed to help users track public transportation in the city of Helsinki, as well as make/view reports made regarding ticket inspectors on various vehicles and stations. 

### Project Specifications
* User Accounts & Roles: there are 3 different roles for this project: users, authorized users, and admins. Users can view the vehicle map and view the 5 most recent votes for a particular station or vehicle, authorized users can do the same as well as make a new report on a vehicle or station, and admins have access to an admin dashboard (/admin) that display statistics about recent reports as well as a table of all reports and all banned users. Admins can delete any reports, as well as ban/unban users. Banned users can still view reports, but cannot make new reports. Users are authorized using Google OAuth through Firebase.
* Database: in this project we use a postgres database with two tables, 'reports' and 'user_bans':
![Database tables](https://github.com/cse264/finalproject-fullstack-ThomasChakif/blob/main/img/tables.png)
!['reports' columns](https://github.com/cse264/finalproject-fullstack-ThomasChakif/blob/main/img/reports.png)
!['user_bans' columns](https://github.com/cse264/finalproject-fullstack-ThomasChakif/blob/main/img/bans.png)
* Interactive UI: our app features a live map of all trams, trains, and vehicles within Helsinki. Users can choose to enable or disable any of these routes. Our app uses React-based elements (Box, Grid, Material React Table, etc.) and a simple color-scheme to provide an engaging and simple user experience. 
* New Library or Framework: to handle the mapping on the home page, we incorporated Leaflet into our app. We also used an MQTT protocol to help with the live vehicle tracking.
* Internal REST API:
  * GET - `/admin` : Get all reports
  * GET - `/adminVehicleResults` : View average vehicle inspector count
  * GET - `/adminStationResults` : View average station inspector count
  * GET - `/adminTopVehicle` : View vehicle with highest all-time inspector count
  * GET - `/adminGetTodaysVotes` : View number of reports made today
  * GET - `/adminGetBans` : Get all banned users
  * POST - `/adminGetRecentVotes` : View recent reports for a vehicle or station
  * POST - `/newReport` : Make a new report
  * POST - `/newBan` : Ban a user
  * DELETE - `/admin/:id` : Delete a report
  * DELETE - `/adminUnban/:id` : Unban a banned user
* External REST API: we use an external API through the MQTT protocol to track the live tracking of vehicles.


### Installation and Running the Project

#### Client
The client for this project uses React.

You must have node.js running on your machine. Once you have cloned this project you can run `npm install` to install all of the packages for this project. Then running `npm run dev` will run the dev version of this code, which will run this project on localhost:5173 (or at the location specified in the console).

#### Server
You must have node.js running on your machine. Once you have cloned this project you can run `npm install` to install all of the packages for this project. Then running `npm run dev` will run the dev version of this code, which will run this project with nodemon. We chose to use our own postgres database for this project, so you'll encounter an error when running `npm run dev` since there won't be a .env file with the database configuration. If needed for testing/grading, please contact us.
