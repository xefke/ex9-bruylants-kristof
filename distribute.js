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

//dal.getDrones();

// 01 // == DRONES == ////
// GET requests on /drones
app.get("/drones", function (request, response) {
    response.send(dal.getDrones());
});




/*

// 01 // == MEASUREMENTS == ////
// GET requests on /measurements
app.get("/measurements", function (request, response) {
    response.send(database.allMeasurements());
});


// GET requests on /measurements with ID => /measurements/:id
app.get("/measurements/:id", function (request, response) {
    var measurement = database.searchMeasurements(request.params.id);
    if (measurement) {
        response.send(measurement); // if a measurement is found, return this measurement
    } else {
        response.status(404).send(); // if no measurement is found, return code 404 'page not found'
    }
});

*/


app.listen(4567);
console.log("server is running");