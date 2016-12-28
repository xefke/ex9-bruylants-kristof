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

//var result = dal.getDrones();
//console.log(result);


//-------------------------------------------------------------------------------------------------------------------//
// 01 // == DRONES == ////
// GET requests on /drones
app.get("/drones", function (request, response) {
    dal.getDrones(function (drones) {
        response.send(drones);
    })
});

// GET requests on /drones with ID => /drones/:id
app.get("/drones/:id", function (request, response) {
    dal.getDroneByID(function (drone){
        response.send(drone);
    }, request.params.id.toString());
});

//-------------------------------------------------------------------------------------------------------------------//
// 02 // == SENSORS == ////
// GET requests on /sensors
app.get("/sensors", function (request, response) {
    dal.getSensors(function (sensors) {
        response.send(sensors);
    })
});

// GET requests on /sensor with ID => /sensors/:id
app.get("/sensors/:id", function (request, response) {
    dal.getSensorsByID(function (sensor){
        response.send(sensor);
    }, request.params.id.toString());
});

// GET requests on /drones/:id/sensors with drone id to get all sensors attached to the drone.
app.get("/drones/:id/sensors", function (request, response) {
    dal.getSensorsByDroneID(function (droneSensors) {
        response.send(droneSensors);
    }, request.params.id.toString());
});

// 03 // == BUILDINGS == ///
// GET requests on /buildings
app.get("/buildings", function (request, response) {
    dal.getBuildings(function (buildings) {
        response.send(buildings);
    })
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