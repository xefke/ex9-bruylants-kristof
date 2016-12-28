/**
 * Created by Xefke on 16/12/2016.
 */
//load dependencies
var express = require('express');
var parser = require('body-parser');
var shortid = require('shortid'); // $npm install shortid --save

// load external sources (datastore and validation)
var dal = require("./storage");
var val = require("./validate");

// create webservice
var app = express();
app.use(parser.json());

// TESTING

//var result = dal.getDrones();
//console.log(result);


//-------------------------------------------------------------------------------------------------------------------//
// 01 // == DRONES == ////
// construct to add new drone
var newDrone = function (id, name, mac, location, created, updated) {
    this._id = id;
    this.name = name;
    this.mac = mac;
    this.location = location;
    this.created = created;
    this.updated = updated;
};

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

// POST request on /drones to add new drone
app.post("/drones", function (request, response) {
    var drone = request.body;
    var now = new Date();
    var postDateTime = now.toISOString()

    //console.log(drone);

    // validate that no fields are empty
    var errors = val.fieldsNotEmpty(drone,"id", "name", "mac_address", "location");
    if (errors){
        response.status(400).send({msg:"Following field(s) are mandatory:"+errors.concat()});
        return;
    };

    // validate for non-existing drone ID and drone MAC address
    dal.getDroneByID(function(returnIDdrone){
        console.log('ID: '+returnIDdrone.length);

        if (returnIDdrone.length == 0) {
            dal.getDroneByMac(function(returnMACdrone){
                console.log('mac: '+returnMACdrone.length)

                if (returnMACdrone.length == 0) {
                    //insert the drone in the database and send response
                    dal.insertDrone(new newDrone(drone.id, drone.name, drone.mac_address, drone.location, postDateTime, postDateTime));
                    response.send("Drone with id "+drone.id+" inserted.");

                } else {
                    response.status(409).send({msg:"The drone MAC address is already registered", link:"../drones/"+returnMACdrone[0]._id});
                }
            }, drone.mac_address);

        } else {
            response.status(409).send({msg:"The drone ID is already registered"});
            //response.status(409).send({msg:"The drone ID is already registered", link:"../drones/"+returnIDdrone[0]._id});
        }
    }, drone.id);

    //insert the drone in the database and send response
    //dal.insertDrone(new newDrone(drone.id, drone.name, drone.mac_address, drone.location, postDateTime, postDateTime));
    //response.send("Drone with id "+drone.id+" inserted.");
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
    dal.getSensorByID(function (sensor){
        response.send(sensor);
    }, request.params.id.toString());
});

// GET requests on /drones/:id/sensors with drone id to get all sensors attached to the drone.
app.get("/drones/:id/sensors", function (request, response) {
    dal.getSensorsByDroneID(function (droneSensors) {
        response.send(droneSensors);
    }, request.params.id.toString());
});

//-------------------------------------------------------------------------------------------------------------------//
// 03 // == BUILDINGS == ///
// Construct for new buildings
var newBuilding = function (id, name, city, longitude, latitude, created, updated) {
    this._id = id;
    this.name = name;
    this.city = city;
    this.longitude = longitude;
    this.latitude = latitude
    this.created = created;
    this.updated = updated;
};

// GET requests on /buildings
app.get("/buildings", function (request, response) {
    dal.getBuildings(function (buildings) {
        response.send(buildings);
    })
});

// POST request on /buildings to add new building
app.post("/buildings", function (request, response) {
    var building = request.body;
    var now = new Date();
    var postDateTime = now.toISOString()


    // validate that no fields are empty
    var errors = val.fieldsNotEmpty(building, "name", "city");
    if (errors){
        response.status(400).send({msg:"Following field(s) are mandatory:"+errors.concat()});
        return;
    };

    // validate for non-existing building name
    dal.getBuildingByName(function(returnNAMEbuilding){
        console.log('ID: '+returnNAMEbuilding.length);

        if (returnNAMEbuilding.length == 0) {
            var buildingID = shortid.generate(); //generate the unique ID
            dal.insertBuilding(new newBuilding(buildingID, building.name, building.city, building.longitude, building.latitude, postDateTime, postDateTime));
            response.send({msg:"Building "+building.name+" with id "+buildingID+" inserted.", link:"../buildings/"+buildingID});

        } else {
            response.status(409).send({msg:"The building with name '"+building.name+"' is already registered", link:"../buildings/"+returnNAMEbuilding[0]._id});
        }

    }, building.name);
});

// PUT request on /buildings/:id to update a building
app.put("/buildings/:id", function (request, response) {
    var now = new Date();
    var putDateTime = now.toISOString();
    var buildingUpdate = request.body;
    buildingUpdate.updated = putDateTime
    console.log(buildingUpdate);


    dal.updateBuilding(request.params.id.toString(), buildingUpdate, putDateTime);
    response.send("test complete")
    /*
    // validate that no fields are empty
    var errors = val.fieldsNotEmpty(building, "name", "city");
    if (errors){
        response.status(400).send({msg:"Following field(s) are mandatory:"+errors.concat()});
        return;
    };

    // validate for non-existing building name
    dal.getBuildingByName(function(returnNAMEbuilding){
        console.log('ID: '+returnNAMEbuilding.length);

        if (returnNAMEbuilding.length == 0) {
            var buildingID = shortid.generate(); //generate the unique ID
            dal.insertBuilding(new newBuilding(buildingID, building.name, building.city, building.longitude, building.latitude, postDateTime, postDateTime));
            response.send({msg:"Building "+building.name+" with id "+buildingID+" inserted.", link:"../buildings/"+buildingID});

        } else {
            response.status(409).send({msg:"The building with name '"+building.name+"' is already registered", link:"../buildings/"+returnNAMEbuilding[0]._id});
        }

    }, building.name);
    */
});

//-------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------//

app.listen(4567);
console.log("server is running");

//-------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------//