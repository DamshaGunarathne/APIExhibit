#!/usr/bin/env node

const axios = require('axios');
const { Command } = require('commander');
const fs = require('fs-extra');
const path = require('path');

const BASE_URL = 'https://ntc-booking-system-1.onrender.com/api';
const AUTH_FILE = path.join(__dirname, 'auth.json'); // File to store logged-in user info

const program = new Command();

// Load logged-in user data (if available)
let loggedInUser = null;
if (fs.existsSync(AUTH_FILE)) {
    loggedInUser = fs.readJsonSync(AUTH_FILE, { throws: false });
}

// Save logged-in user data
function saveLoggedInUser(user) {
    loggedInUser = user;
    fs.writeJsonSync(AUTH_FILE, user);
}

// Check if user is an admin
function isAdmin() {
    return loggedInUser && loggedInUser.role === 'Admin';
}

// Function to register a user
async function registerUser(name, email, password, role) {
    try {
        const response = await axios.post(`${BASE_URL}/users/register`, {
            name,
            email,
            password,
            role,
        });
        console.log('User registered successfully:', response.data);
    } catch (error) {
        console.error('Error registering user:', error.response ? error.response.data : error.message);
    }
}

// Function to login a user
async function loginUser(email, password) {
    try {
        const response = await axios.post(`${BASE_URL}/users/login`, { email, password });
        saveLoggedInUser(response.data); // Save logged-in user data
        console.log('User logged in successfully:', response.data);
    } catch (error) {
        console.error('Error logging in:', error.response ? error.response.data : error.message);
    }
}

// Function to add a transport route (admin only)
async function addTransportRoute(routeNumber, routeName, startingPoint, endingPoint, distance) {
    if (!isAdmin()) {
        console.error('Error: You must be an admin to add a transport route.');
        return;
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/admin/routes`,
            { routeNumber, routeName, startingPoint, endingPoint, distance },
            { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
        );
        console.log('Transport route added successfully:', response.data);
    } catch (error) {
        console.error('Error adding route:', error.response ? error.response.data : error.message);
    }
}

// Function to fetch and display all bus routes (admin only)
async function viewRoutes() {
    if (!isAdmin()) {
        console.error('Error: You must be an admin to view bus routes.');
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/admin/routes`, {
            headers: { Authorization: `Bearer ${loggedInUser.token}` },
        });
        console.log('Bus Routes Schedule:');
        response.data.forEach((route, index) => {
            console.log(
                `${index + 1}. Route Number: ${route.routeNumber}, Name: ${route.routeName}, Start: ${route.startingPoint}, End: ${route.endingPoint}, Distance: ${route.distance}`
            );
        });
    } catch (error) {
        console.error('Error fetching routes:', error.response ? error.response.data : error.message);
    }
}

// Function to add a transport route (admin only)
async function addBuses(busNumber,driverName,conductorName,operatorname,bustype,capacity,price,availableSeats,registrationNumber,routeNumber) {
    if (!isAdmin()) {
        console.error('Error: You must be an admin to add a transport route.');
        return;
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/admin/routes`,
            { busNumber,driverName,conductorName,operatorname,bustype,capacity,price,availableSeats,registrationNumber,routeNumber },
            { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
        );
        console.log('Bus added successfully:', response.data);
    } catch (error) {
        console.error('Error adding bus:', error.response ? error.response.data : error.message);
    }
}
// Function to view all buses with their assigned routes (admin only)
async function viewBusesWithRoutes() {
    if (!isAdmin()) {
        console.error('Error: You must be an admin to view buses and their routes.');
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/admin/buses`, {
            headers: { Authorization: `Bearer ${loggedInUser.token}` },
        });
        console.log('Buses with Assigned Routes:');
        response.data.forEach((bus, index) => {
            console.log(
                `${index + 1}. Bus Number: ${bus.busNumber}, Driver: ${bus.driverName}, Conductor: ${bus.conductorName}, Operator: ${bus.operatorName}, Type: ${bus.bustype}, Capacity: ${bus.capacity}, Price: ${bus.price}, Available Seats: ${bus.availableSeats}, Registration Number: ${bus.registrationNumber}, Route: ${bus.route ? bus.route.routeName : 'Unassigned'}`
            );
        });
    } catch (error) {
        console.error('Error fetching buses with routes:', error.response ? error.response.data : error.message);
    }
}

// Function to view available buses based on departure point, end point, and date
async function viewAvailableBuses(departurePoint, arrivalPoint, date) {
    if (!loggedInUser || !loggedInUser.token) {
        console.error('Error: You must be logged in to view available buses.');
        return;
    }

    try {
        const response = await axios.get(`${BASE_URL}/commuter/searchbus`, {
            params: { departurePoint, arrivalPoint, date },
            headers: { Authorization: `Bearer ${loggedInUser.token}` }
        });
        console.log(`Available Buses from ${departurePoint} to ${arrivalPoint} on ${date}:`);
        response.data.forEach((bus, index) => {
            console.log(
                `${index + 1}. Bus Number: ${bus.busNumber}, Driver: ${bus.driverName}, Conductor: ${bus.conductorName}, Type: ${bus.bustype}, Capacity: ${bus.capacity}, Price: ${bus.price}, Available Seats: ${bus.availableSeats}, Registration Number: ${bus.registrationNumber}, Departure Time: ${bus.departureTime}`
            );
        });
    } catch (error) {
        console.error('Error fetching available buses:', error.response ? error.response.data : error.message);
    }
}
// Function to book a bus
async function bookBus(bookingNumber, userName, seatCount, bookingDate, scheduleToken, bookingToken) {
    if (!loggedInUser || !loggedInUser.token) {
        console.error('Error: You must be logged in to book a bus.');
        return;
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/commuter/bookbus`,
            {
                bookingNumber,
                userName,
                seatCount,
                bookingDate,
                scheduleToken,
                bookingToken
            },
            { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
        );
        console.log('Bus booked successfully:', response.data);
    } catch (error) {
        console.error('Error booking bus:', error.response ? error.response.data : error.message);
    }
}


// Function to view schedules
async function viewSchedules() {
    try {
        const response = await axios.get(`${BASE_URL}/schedules`);
        console.log('Available schedules:', response.data);
    } catch (error) {
        console.error('Error viewing schedules:', error.response ? error.response.data : error.message);
    }
}

// Function to add a bus (admin only)
async function addBus(busNumber, driverName, conductorName, operatorName, bustype, capacity, price, availableSeats, registrationNumber, routeNumber) {
    if (!isAdmin()) {
        console.error('Error: You must be an admin to add a bus.');
        return;
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/admin/buses`, // Correct endpoint for adding a bus
            {
                busNumber,
                driverName,
                conductorName,
                operatorName,
                bustype,
                capacity,
                price,
                availableSeats,
                registrationNumber,
                routeNumber
            },
            { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
        );
        console.log('Bus added successfully:', response.data);
    } catch (error) {
        console.error('Error adding bus:', error.response ? error.response.data : error.message);
    }
}
// Function to add a bus schedule
async function addBusSchedule(routeNumber, routeName, registrationNumber, operatorName, busType, ticketPrice, capacity, availableSeats, departurePoint, departureTime, arrivalPoint, arrivalTime, stops, startDate, endDate, scheduleToken, isActive) {
    if (!loggedInUser || !loggedInUser.token) {
        console.error('Error: You must be logged in to add a bus schedule.');
        return;
    }

    try {
        const response = await axios.post(
            `${BASE_URL}/operator/schedules`,
            {
                route: { routeNumber, routeName },
                bus: { registrationNumber, operatorName, busType, ticketPrice, capacity, availableSeats },
                departurePoint,
                departureTime,
                arrivalPoint,
                arrivalTime,
                stops: stops.split(','),
                scheduleValid: { startDate, endDate },
                scheduleToken,
                isActive: isActive === 'true' // Convert string to boolean
            },
            { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
        );
        console.log('Bus schedule added successfully:', response.data);
    } catch (error) {
        console.error('Error adding bus schedule:', error.response ? error.response.data : error.message);
    }
}
// Function to update a bus schedule
async function updateBusSchedule(scheduleToken, departurePoint, departureTime, arrivalPoint, arrivalTime, stops) {
    if (!loggedInUser || !loggedInUser.token) {
        console.error('Error: You must be logged in to update a bus schedule.');
        return;
    }

    try {
        const response = await axios.put(
            `${BASE_URL}/operator/schedules/${scheduleToken}`,
            {
                departurePoint,
                departureTime,
                arrivalPoint,
                arrivalTime,
                stops: stops.split(',')
            },
            { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
        );
        console.log('Bus schedule updated successfully:', response.data);
    } catch (error) {
        console.error('Error updating bus schedule:', error.response ? error.response.data : error.message);
    }
}
// Function to delete a bus schedule
async function deleteBusSchedule(scheduleToken) {
    if (!loggedInUser || !loggedInUser.token) {
        console.error('Error: You must be logged in to delete a bus schedule.');
        return;
    }

    try {
        const response = await axios.delete(
            `${BASE_URL}/operator/schedules/${scheduleToken}`,
            { headers: { Authorization: `Bearer ${loggedInUser.token}` } }
        );
        console.log('Bus schedule deleted successfully:', response.data);
    } catch (error) {
        console.error('Error deleting bus schedule:', error.response ? error.response.data : error.message);
    }
}


// Note management functions
function addNote(content) {
    const notes = loadNotes();
    notes.push(content);
    saveNotes(notes);
    console.log('Note added!');
}

function viewNotes() {
    const notes = loadNotes();
    if (notes.length > 0) {
        console.log('Notes:');
        notes.forEach((note, index) => {
            console.log(`${index + 1}. ${note}`);
        });
    } else {
        console.log('No notes available.');
    }
}

function loadNotes() {
    if (fs.existsSync(AUTH_FILE)) {
        return fs.readJsonSync(AUTH_FILE, { throws: false }) || [];
    }
    return [];
}

function saveNotes(notes) {
    fs.writeJsonSync(AUTH_FILE, notes);
}

// CLI commands
program
    .command('register <name> <email> <password> <role>')
    .description('Register a new user')
    .action(registerUser);

program
    .command('login <email> <password>')
    .description('Login with a user')
    .action(loginUser);

program
    .command('routes <routeNumber> <routeName> <startingPoint> <endingPoint> <distance>')
    .description('Add a new transport route (Admin only)')
    .action(addTransportRoute);

program
    .command('view-routes')
    .description('View all bus routes (Admin only)')
    .action(viewRoutes);

program
    .command('add-bus <busNumber> <driverName> <conductorName> <operatorName> <bustype> <capacity> <price> <availableSeats> <registrationNumber> <routeNumber>')
    .description('Add a new bus (Admin only)')
    .action(addBus);

program
    .command('view-buses')
    .description('View all buses with their assigned routes (Admin only)')
    .action(viewBusesWithRoutes);

program
    .command('view-available-buses <departurePoint> <arrivalPoint> <date>')
    .description('View available buses based on departure point, arrival point, and date')
    .action(viewAvailableBuses);

program
    .command('book-bus <bookingNumber> <userName> <seatCount> <bookingDate> <scheduleToken> <bookingToken>')
    .description('Book a bus')
    .action(bookBus);

program
    .command('add-schedule <routeNumber> <routeName> <registrationNumber> <operatorName> <busType> <ticketPrice> <capacity> <availableSeats> <departurePoint> <departureTime> <arrivalPoint> <arrivalTime> <stops> <startDate> <endDate> <scheduleToken> <isActive>')
    .description('Add a new bus schedule')
    .action(addBusSchedule);

program
    .command('update-schedule <scheduleToken> <departurePoint> <departureTime> <arrivalPoint> <arrivalTime> <stops>')
    .description('Update a bus schedule using the schedule token')
    .action(updateBusSchedule);

program
    .command('delete-schedule <scheduleToken>')
    .description('Delete a bus schedule using the schedule token')
    .action(deleteBusSchedule);



program
    .command('view-schedules')
    .description('View bus schedules')
    .action(viewSchedules);

program
    .command('add-note <content>')
    .description('Add a note')
    .action(addNote);

program
    .command('view-notes')
    .description('View all notes')
    .action(viewNotes);

program.parse(process.argv);
