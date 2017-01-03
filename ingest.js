/**
 * Created by Xefke on 14/12/2016.
 */

// >$ npm install request --save
var request = require("request");
var dal = require('./storage');
var shortid = require('shortid'); // $npm install shortid --save

// http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// create a base construct for connecting, includes the login credentials
var BASE_URL = "https://web-ims.thomasmore.be/datadistribution/API/2.0";
var Settings = function (url) {
    this.url = BASE_URL + url;
    this.method = "GET";
    this.qs = {format: 'json'};
    this.headers = {
        authorization: "Basic aW1zOno1MTJtVDRKeVgwUExXZw=="
    };
};

// Constructs for writing to DB in correct format
// ==============================================
var Drone = function (id, name, mac, location, created, updated) {
    this._id = id;
    this.name = name;
    this.mac = mac;
    this.location = location;
    this.created = created;
    this.updated = updated;
};
var Location = function (id, name, length, width, volume, capacity, building, buildingref, created, updated) {
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
var FileHeader = function (fileid, droneref) {
    this._id = fileid;
    this.droneref = droneref;
};
var File = function (fileid, dateLoaded, first_rec, last_rec, droneid, records) {
    this._id = fileid;
    this.date_loaded = dateLoaded;
    this.date_first_record = first_rec;
    this.date_last_record = last_rec;
    this.drone_ref = droneid
    this.contents_count = records;
};
var Content = function (contentid, type, contentdate, source, location, locationref, building, buildingref, macaddress, rssi, created, updated, fileref) {
    this._id = contentid;
    this.type = type;
    this.timestamp = contentdate;
    this.source = source;
    this.location = location;
    this.locationref = locationref
    this.building = building;
    this.buildingref = buildingref
    this.mac_address = macaddress;
    this.rssi = rssi;
    this.created = created;
    this.updated = updated;
    this.ref = fileref;
};

// Clearing DB before adding the new data
// ======================================
dal.clearDrone(); // to delete the collection of drones
dal.clearLocation(); // to delete the collection of locations
dal.clearFileHeaders(); // to delete the collection of files
dal.clearFile(); // to delete the collection of files
//dal.clearContent(); // to delete the collection of contents
dal.clearMeasurement(); // to delete the collection of contents

// Filling the DB
// ==============
// 1 - GET THE LIST OF DRONES
var dronesSettings = new Settings("/drones?format=json"); // build the necessairy URL
request(dronesSettings, function (error, response, dronesString) { // call 1: List all drones
    var drones = JSON.parse(dronesString);
    //console.log("Call 1: List of drones")
    //console.log(drones); // since this is a list, drones.id cannot be used

    // 2 - DO SOMETHING FOR EACH DRONE IN THE LIST
    drones.forEach(function (drone) {

        // 3 - GET THE DETAILS FOR EACH FOUND DRONE AND WRITE THEM TO DB, RINSE AND REPEAT
        var droneSettings = new Settings("/drones/" + drone.id + "?format=json");
        request(droneSettings, function (error, response, droneString) { // call 2: list details for each drone ID of the call 1 list + write to DB
            var drone = JSON.parse(droneString);
            //console.log(drone.id); // since this per drone, drone.id is possible
            var now = new Date();
            var droneDateTime = now.toISOString();
            var locationID = shortid.generate(); // create an unique ID
            var locationBuilding = "Zandpoortvest"
            var locationBuildingRef = "buildings/BJ19uwZBe"
            dal.insertDrone(new Drone(drone.id, drone.name, drone.mac_address, drone.location, droneDateTime, droneDateTime));
            dal.insertLocation(new Location(locationID, drone.location, null, null, null, null, locationBuilding, locationBuildingRef, droneDateTime, droneDateTime));
            //console.log('Drone | ID: '+drone.id+' Name: '+drone.name+' MAC: '+drone.mac_address+' Location: '+drone.location);

            // 4 - GET THE LIST OF FILES FOR EACH DRONE
            var filesHeaderSettings = new Settings("/files?drone_id.is=" + drone.id + "&format=json&date_loaded.greaterOrEqual=2016-12-27"); // filtered on a few days
            request(filesHeaderSettings, function (error, response, fileheadersString) { // call 3: list all file headers for all drones
                try{ //error start for fileHeaders
                var fileHeaders = JSON.parse(fileheadersString);
                //console.log(fileHeaders); // since this is a list of all files for a certain drone, fileHeaders.id is not possible

                // 5 - DO SOMETHING FOR EACH FOUND FILE HEADER IN THE LIST
                fileHeaders.forEach(function (file) {
                    dal.insertFileHeader(new FileHeader(file.id, file.ref));
                    //console.log('file ID:'+file.id+ 'drone ref.: '+ file.ref);

                    // 6 -  GET THE DETAILS FOR EACH FILE AND WRITE THEM TO DB, AGAIN, RINSE AND REPEAT
                    var fileSettings = new Settings("/files/"+file.id+"?format=json");
                    request(fileSettings, function (error, response, fileString) { // call 4: details for all files + write to db
                        try{ //error start for files
                        var file = JSON.parse(fileString);
                        dal.insertFile(new File(file.id, file.date_loaded, file.date_first_record, file.date_last_record, file.ref, file.contents_count));
                        //console.log('File | ID: '+file.id+' Load Date: '+file.date_loaded+' First Record: '+file.date_first_record+' Last Record: '+file.date_last_record+' Ref.: '+file.ref);

                        // 7 - GET THE LIST OF CONTENTS PER FILE
                        var contentHeadersSettings = new Settings("/files/"+file.id+"/contents?format=json");
                        request(contentHeadersSettings, function (error, response, contentheadersString) { // call 5: list all content headers for all files
                            try{
                            var contentHeaders = JSON.parse(contentheadersString);
                            //console.log(contentHeaders[1].id);

                            // 8 - DO SOMETHING FOR EACH FOUND CONTENT HEADER IN THE LIST
                            contentHeaders.forEach(function(content) {

                                // 9 - GET THE DETAILS FOR EACH CONTENT AND WRITE TO THE DB
                                var contentSettings = new Settings("/files/"+file.id+"/contents/"+content.id+"?format=json");
                                request(contentSettings, function(error, response, contentString) {
                                    try { //error start for contents
                                    var content = JSON.parse(contentString);
                                        // additional data
                                        var contentType = "probe";
                                        var contentSource = "drones/"+drone.id;
                                        var contentLocationRef = "locations/"+locationID;
                                        var contentBuilding = "Zandpoortvest";
                                        var contentBuildingRef = "buildings/BJ19uwZBe";
                                        var now = new Date();
                                        var contentDateTime = now.toISOString();

                                    dal.insertContent(new Content(
                                        content.id,
                                        contentType,
                                        content.datetime,
                                        contentSource,
                                        drone.location,
                                        contentLocationRef,
                                        contentBuilding,
                                        contentBuildingRef,
                                        content.mac_address,
                                        content.rssi,
                                        contentDateTime,
                                        contentDateTime,
                                        content.ref
                                        ));
                                    //console.log('Content | type: '+contentType+' Source: '+contentSource+' loca: '+drone.location+' Build: '+contentBuilding+' Created: '+contentDateTime);
                                    } catch (error) {console.log(error);} // error catch for content details
                                }); // end content details request
                            }); // end content header forEach
                            } catch (error) {console.log(error);} // error catch for content headers
                        }); // end content header request
                        } catch (error) {console.log(error);} // error catch for file details
                    }); // end file detail request
                }); // end file headers forEach
                } catch (error) {console.log(error);} // error catch for file headers
            }); // end file headers request
        }); // end drone details request
    }); // end drones forEach
}); // end drones request

