/**
 * Created by Xefke on 16/12/2016.
 */

// load dependencies
var express = require('express');
var parser = require('body-parser');
var shortid = require('shortid'); // $npm install shortid --save

// load external sources (datastore and validation)
var dal = require("./storage");
var val = require("./validate");

// create webservice
var app = express();
app.use(parser.json());

// run webservice //
app.listen(4567);
console.log("server is running");

// function in order to capitalise the first letter of a string for search on names.
// source: http://www.geekality.net/2010/06/30/javascript-uppercase-first-letter-in-a-string/
// altered the function a small bit to have all but the first letter of a string in small letters as well.
String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.substr(1).toLowerCase();
};
// e.g.: brUYlaNTs as input would correctly be reformatted as Bruylants as demonstrated in the below console.log
//console.log("brUYlaNTs".ucfirst()); // result = Bruylants


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

    // validate that no obligated fields are empty
    var errors = val.fieldsNotEmpty(drone, "name", "mac_address", "location");
    if (errors){
        response.status(400).send({msg:"Following field(s) are mandatory:"+errors.concat()});
        return;
    };

    // validate for non-existing drone ID and drone MAC address
    dal.getDroneByID(function(returnIDdrone){
        if (returnIDdrone.length == 0) {
            dal.getDroneByMac(function(returnMACdrone){
                if (returnMACdrone.length == 0) {
                    //insert the drone in the database and send response
                    var droneID = shortid.generate(); //generate the unique ID
                    dal.insertDrone(new newDrone(droneID, drone.name, drone.mac_address, drone.location, postDateTime, postDateTime));
                    response.send("Drone with id "+droneID+" inserted.");
                } else {
                    response.status(409).send({msg:"The drone MAC address is already registered", link:"../drones/"+returnMACdrone[0]._id});
                }
            }, drone.mac_address);
        } else {
            response.status(409).send({msg:"The drone ID is already registered", link:"../drones/"+returnIDdrone[0]._id});
        }
    }, drone.id);
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

// GET requests on /buildings/:id
app.get("/buildings/:id", function (request, response) {
    dal.getBuildingByID(function (building){
        response.send(building);
    }, request.params.id.toString());
});

// GET requests on /buildings/names/:name
app.get("/buildings/names/:name", function (request, response) {
    var name = request.params.name.toString().ucfirst(); //reformat name into correct casing.
    dal.getBuildingByName(function (building){
        response.send(building);
    }, name);
});

// POST request on /buildings to add new building
app.post("/buildings", function (request, response) {
    var building = request.body;
    var now = new Date();
    var postDateTime = now.toISOString();

    // validate that no fields are empty
    var errors = val.fieldsNotEmpty(building, "name", "city");
    if (errors){
        response.status(400).send({msg:"Following field(s) are mandatory:"+errors.concat()});
        return;
    };

    // validate for non-existing building name
    dal.getBuildingByName(function(returnNAMEbuilding){
        if (returnNAMEbuilding.length == 0) {
            var buildingID = shortid.generate(); //generate the unique ID
            var nameUC = building.name.ucfirst(); // make sure all building name are in the database with first letter capitals
            var cityUC = building.city.ucfirst(); // make sure all city names are in the database with first letter capitals
            dal.insertBuilding(new newBuilding(buildingID, nameUC, cityUC, building.longitude, building.latitude, postDateTime, postDateTime));
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

    dal.updateBuilding(request.params.id.toString(), buildingUpdate);
    response.send({msg:"Building with ID "+request.params.id.toString()+" updated.", link:"../buildings/"+request.params.id.toString()});
});

// DELETE requests on /buildings with ID => /buildings/:id
app.delete("/buildings/:id", function (request, response) {
    dal.getBuildingByID(function (building){ // check if the location exists
        if (building.length == 0) { // if not, display message
            response.send({msg:"Building with ID "+request.params.id.toString()+" does not exist."});
        } else { //if so, check for use of this building in other resources.
            console.log(building);
            console.log(building[0].name);
            var buildingName = building[0].name.ucfirst(); // make sure the search is in correct capitalisation
            dal.getLocationsByBuilding(function(location){ // check if the building is used in locations
                if (location.length != 0) {
                    response.send({msg:"Building with ID "+request.params.id.toString()+" is in use for a location.", link:"../locations/"+location[0]._id});
                } else { // if not used in locations, then delete it and confirm
                    dal.deleteBuilding(request.params.id.toString());
                    response.send({msg:"Buildings with ID "+request.params.id.toString()+" deleted."});
                }
            },buildingName);
        }
    }, request.params.id.toString());
});

//-------------------------------------------------------------------------------------------------------------------//
// 04 // == LOCATIONS == ///
// Construct for new locations
var newLocation = function (id, name, length, width, volume, capacity, building, buildingref, created, updated) {
    this._id = id;
    this.name = name;
    this.loclength = length;
    this.locwidth = width;
    this.volume = volume;
    this.capacity = capacity;
    this.building = building;
    this.buildingref = buildingref;
    this.created = created;
    this.updated = updated;
};

// GET requests on /locations
app.get("/locations", function (request, response) {
    dal.getLocations(function (locations) {
        response.send(locations);
    })
});

// GET requests on /locations with ID => /locations/:id
app.get("/locations/:id", function (request, response) {
    dal.getLocationByID(function (location){
        response.send(location);
    }, request.params.id.toString());
});

// GET requests on /locations/buildings with name => /locations/buildings/:name
app.get("/locations/buildings/:name", function (request, response) {
    var building = request.params.name.toString().ucfirst(); // make sure the search is in correct capitalisation
    dal.getLocationsByBuilding(function (location){
        response.send(location);
    }, building);
});

// POST request on /locations to add a new location
app.post("/locations", function (request, response) {
    var location = request.body;
    var now = new Date();
    var postDateTime = now.toISOString()

    // validate that no fields are empty
    var errors = val.fieldsNotEmpty(location, "name");
    if (errors){
        response.status(400).send({msg:"Following field(s) are mandatory:"+errors.concat()});
        return;
    };

    // insert the new location into the databases
    var locationID = shortid.generate(); //generate the unique ID
    var nameUC = location.name.ucfirst(); // make sure all location names are in the database with first letter capitals
    var buildingUC = location.building.ucfirst();
    dal.getBuildingByName(function(returnBuilding){
        if (returnBuilding.length != 0) {
            console.log('buildingref.: '+returnBuilding[0]._id);
            var locationBuildingRef = "buildings/"+returnBuilding[0]._id;
            dal.insertLocation(new newLocation(locationID, nameUC, location.length, location.width, location.volume, location.capacity, buildingUC, locationBuildingRef, postDateTime, postDateTime));
            response.send({msg:"Location '"+nameUC+"' with id "+locationID+" inserted.", link:"../locations/"+locationID});
        } else {
            response.status(409).send({msg:"The building with name '"+location.building+"' does not exist. Create this first."});
        }
    },buildingUC);

});

// PUT request on /buildings/:id to update a building
app.put("/locations/:id", function (request, response) {
    var now = new Date();
    var putDateTime = now.toISOString();
    var locationUpdate = request.body;
    locationUpdate.updated = putDateTime

    dal.updateLocation(request.params.id.toString(), locationUpdate);
    response.send({msg:"Location with ID "+request.params.id.toString()+" updated.", link:"../locations/"+request.params.id.toString()});
});

// DELETE requests on /locations with ID => /locations/:id
app.delete("/locations/:id", function (request, response) {
    dal.getLocationByID(function (location){ // check if the location exists
        if (location.length == 0) { // if not, display message
            response.send({msg:"Location with ID "+request.params.id.toString()+" does not exist."});
        } else { //if so, delete it and confirm
            dal.deleteLocation(request.params.id.toString());
            response.send({msg:"Location with ID "+request.params.id.toString()+" deleted."});
        }
    }, request.params.id.toString());
});

//-------------------------------------------------------------------------------------------------------------------//
// 05 // == COURSES == ///
// Under Construction

//-------------------------------------------------------------------------------------------------------------------//
// 06 // == PEOPLE == ///
// Construct for new people
var newPerson = function (id, lastname, firstname, course, created, updated) {
    this._id = id;
    this.lastname = lastname;
    this.firstname = firstname;
    this.course = course;
    this.created = created;
    this.updated = updated;
};

// GET requests on /people
app.get("/people", function (request, response) {
    dal.getPeople(function (people) {
        response.send(people);
    })
});

// GET request on people/name/:lastname - to find a person based on last name
app.get("/people/name/:lastname/", function (request, response) {
    var lastname = request.params.lastname.toString().ucfirst(); //reformat name into correct casing.
    dal.getPeopleByName(function (person){
        response.send(person);
    }, lastname);
});

// GET request on people/names/:lastname/:firstname - to find a person based on last name AND firstname
app.get("/people/names/:lastname/:firstname", function (request, response) {
    var lastname = request.params.lastname.toString().ucfirst(); //reformat lastname into correct casing.
    var firstname = request.params.firstname.toString().ucfirst(); //reformat firstname into correct casing.
    dal.getPeopleByNames(function (person){
        response.send(person);
    }, lastname, firstname);
});

// GET request on people/:id - to find a person based on ID
app.get("/people/:id/", function (request, response) {
    dal.getPeopleByID(function (person){
        response.send(person);
    }, request.params.id.toString());
});

// POST request on /people to add new person
app.post("/people", function (request, response) {
    var person = request.body;
    var now = new Date();
    var postDateTime = now.toISOString()

    // validate that no fields are empty
    var errors = val.fieldsNotEmpty(person, "lastname", "firstname");
    if (errors){
        response.status(400).send({msg:"Following field(s) are mandatory:"+errors.concat()});
        return;
    };

    // insert the new person into the databases
    var personID = shortid.generate(); //generate the unique ID
    var lastnameUC = person.lastname.ucfirst(); // make sure all lastnames are in the database with first letter capitals
    var firstnameUC = person.firstname.ucfirst(); // make sure all firstnames are in the database with first letter capitals
    dal.insertPeople(new newPerson(personID, lastnameUC, firstnameUC, person.course, postDateTime, postDateTime));
    response.send({msg:"Person "+person.lastname+" "+person.firstname+" with id "+personID+" inserted.", link:"../people/"+personID});
});

// PUT request on /people/:id to update a person
app.put("/people/:id", function (request, response) {
    var now = new Date();
    var putDateTime = now.toISOString();
    var personUpdate = request.body;
    personUpdate.updated = putDateTime;
    var lastnameUC = personUpdate.lastname.ucfirst(); // make sure updates on lastname happen with capital first letter
    var firstnameUC = personUpdate.firstname.ucfirst(); // make sure updates on firstname happen with capital first letter
    personUpdate.lastname = lastnameUC;
    personUpdate.firstname = firstnameUC;

    dal.updatePeople(request.params.id.toString(), personUpdate);
    response.send({msg:"Person with ID "+request.params.id.toString()+" updated.", link:"../people/"+request.params.id.toString()});
});

//-------------------------------------------------------------------------------------------------------------------//
// 07 // == EVENTS == ///
// Under Construction

//-------------------------------------------------------------------------------------------------------------------//
// 08 // == MEASUREMENTS == ///
// GET requests on /measurements
app.get("/measurements", function (request, response) {
    dal.getMeasurements(function (people) {
        response.send(people);
    })
});

// GET requests on /measurements/:id => get the measurement for a specified ID
app.get("/measurements/:id", function (request, response) {
    dal.getMeasurementsByID(function (measurement){
        response.send(measurement);
    }, request.params.id.toString());
});

// GET requests on /measurements/buildings/:name => get all measurements for a specified building
app.get("/measurements/buildings/:name", function (request, response) {
    var buildingName = request.params.name.toString().ucfirst(); //reformat name into correct casing.
    dal.getMeasurementsByBuilding(function (measurements){
        response.send(measurements);
    }, buildingName);
});

// GET requests on /measurements/locations/:name => get all measurements for a specified location
app.get("/measurements/locations/:name", function (request, response) {
    var locationName = request.params.name.toString().ucfirst(); //reformat name into correct casing.
    dal.getMeasurementsByLocation(function (measurements){
        response.send(measurements);
    }, locationName);
});

// GET requests on /measurements/types/:type => get all measurements for a specified type
app.get("/measurements/types/:type", function (request, response) {
    var type = request.params.type.toString().ucfirst(); //reformat name into correct casing.
    dal.getMeasurementsByType(function (measurements){
        response.send(measurements);
    }, type);
});

//-------------------------------------------------------------------------------------------------------------------//
// *** END ***
//-------------------------------------------------------------------------------------------------------------------//