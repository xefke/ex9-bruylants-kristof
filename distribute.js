/**
 * Created by Xefke on 16/12/2016.
 */
//load dependencies
var express = require('express');
var parser = require('body-parser');
//var shortid = require('shortid');

// load database
var dal = require("./storage");

// create webservice
var app = express();
app.use(parser.json());

// TESTING

var result = dal.getDrones();
console.log(result);


//-------------------------------------------------------------------------------------------------------------------//
// 01 // == DRONES == ////
// GET requests on /drones
app.get("/drones", function (request, response) {
    response.send(dal.getDrones());
});

app.get("/drones/:id", function (request, response) {
    var drone = dal.getDroneByID(request.params.id.toString());
    if (drone) {
        response.send(drone); // if a measurement is found, return this measurement
    } else {
        response.status(404).send(); // if no measurement is found, return code 404 'page not found'
    }
});

//-------------------------------------------------------------------------------------------------------------------//
// 02 // == SENSORS == ////
// GET requests on /sensors
app.get("/sensors", function (request, response) {
    response.send(dal.getSensors());
});

// GET requests on /sensor with ID => /sensors/:id
app.get("/sensors/:id", function (request, response) {
    var sensor = dal.getSensorsByID(request.params.id);
    if (sensor) {
        response.send(sensor); // if a sensor is found, return this drone information
    } else {
        response.status(404).send(); // if no sensor is found, return code 404 'page not found'
    }
});

// GET requests on /drones/:id/sensors with drone id to get all sensors attached to the drone.
app.get("/drones/:id/sensors", function (request, response) {
    var droneSensor = dal.getSensorsByDroneID(request.params.id);
    if (droneSensor) {
        response.send(droneSensor); // if a drone and sensors are found, return this information
    } else {
        response.status(404).send(); // if no drone or sensors are found, return code 404 'page not found'
    }
});

// POST request on /sensors
app.post("/sensors", function (request, response) {
    var sensor = request.body; // take in the JSON request body from the POST request

    // ID is chosen by the server, it generates a unique ID
    var uniqueID = shortid.generate(); //generate the unique ID
    sensor.id = uniqueID;

    // add the measurement to the store
    dal.addSensor();
    response.status(201).location("../sensors/"+sensor.id).send(); //respond with the 201 status 'Created' and give the URL of the created drone.
});



/*

// 01 // == MEASUREMENTS == ////
// GET requests on /measurements
app.get("/measurements", function (request, response) {
    response.send(database.allMeasurements());
});


// GET requests on /measurements with ID => /measurements/:id


*/


app.listen(4567);
console.log("server is running");