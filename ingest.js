/**
 * Created by Xefke on 14/12/2016.
 */

// >$ npm install request --save
var request = require("request");
var dal = require('./storage');

// http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


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
var Drone = function (id, name, mac, location) {
    this._id = id;
    this.name = name;
    this.mac = mac;
    this.location = location;
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

var Content = function (contentid, macaddress, contentdate, rssi, fileref) {
    this._id = contentid;
    this.mac_address = macaddress;
    this.contentdate = contentdate;
    this.rssi = rssi;
    this.ref = fileref;
};

// Clearing DB before adding the new data
// ======================================
//dal.clearDrone(); // to delete the collection of drones
//dal.clearFileHeaders(); // to delete the collection of files
//dal.clearFile(); // to delete the collection of files
//dal.clearContent(); // to delete the collection of contents

dal.getDrones();
dal.getDroneByID('5a92f5f3cdbc4ec580f0fde904713898');


// FOR TESTING PURPOSES ONLY !!!!
// ==============================
/* For testing I decided to use a fixed drone ID, one of this drone's file ID */
//var fixedDroneID = '68543c10992f465e927b21c25675263b';
//var fixedFileID = '022e728cbe434e2db6444481bc8f7754';


/*

// 1 - GET THE LIST OF DRONES
var dronesSettings = new Settings("/drones?format=json"); // build the necessairy URL
request(dronesSettings, function (error, response, dronesString) { // call 1: List all drones
    var drones = JSON.parse(dronesString);
    //console.log("Call 1: List of drones")
    //console.log(drones); // since this is a list, drones.id cannot be used

    // 2 - DO SOMETHING FOR EACH DRONE IN THE LIST
    drones.forEach(function (drone) {
        //console.log('drone ID:' +drone.id);

        // 3 - GET THE DETAILS FOR EACH FOUND DRONE AND WRITE THEM TO DB, RINSE AND REPEAT
        var droneSettings = new Settings("/drones/" + drone.id + "?format=json");
        //var droneSettings = new Settings("/drones/" + fixedDroneID + "?format=json");
        request(droneSettings, function (error, response, droneString) { // call 2: list details for each drone ID of the call 1 list + write to DB
            var drone = JSON.parse(droneString);
            //console.log(drone.id); // since this per drone, drone.id is possible
            dal.insertDrone(new Drone(drone.id, drone.name, drone.mac_address, drone.location));
            //console.log('Drone | ID: '+drone.id+' Name: '+drone.name+' MAC: '+drone.mac_address+' Location: '+drone.location);

            // 4 - GET THE LIST OF FILES FOR EACH DRONE
            var filesHeaderSettings = new Settings("/files?drone_id.is=" + drone.id + "&format=json");
            //var filesHeaderSettings = new Settings("/files?drone_id.is=" + fixedDroneID + "&format=json");
            request(filesHeaderSettings, function (error, response, fileheadersString) { // call 3: list all file headers for all drones
                var fileHeaders = JSON.parse(fileheadersString);
                //console.log(fileHeaders); // since this is a list of all files for a certain drone, fileHeaders.id is not possible

                // 5 - DO SOMETHING FOR EACH FOUND FILE HEADER IN THE LIST
                fileHeaders.forEach(function (file) {
                    dal.insertFileHeader(new FileHeader(file.id, file.ref));
                    //console.log('file ID:'+file.id+ 'drone ref.: '+ file.ref);

                    // 6 -  GET THE DETAILS FOR EACH FILE AND WRITE THEM TO DB, AGAIN, RINSE AND REPEAT
                    var fileSettings = new Settings("/files/"+file.id+"?format=json");
                    //var fileSettings = new Settings("/files/"+fixedFileID+"?format=json");
                    request(fileSettings, function (error, response, fileString) { // call 4: details for all files + write to db
                        var file = JSON.parse(fileString);
                        //console.log('file ID:'+file.id+ ' drone ref.: '+ file.ref+' contents: '+file.contents_count);
                        dal.insertFile(new File(file.id, file.date_loaded, file.date_first_record, file.date_last_record, file.ref, file.contents_count));
                        //console.log('File | ID: '+file.id+' Load Date: '+file.date_loaded+' First Record: '+file.date_first_record+' Last Record: '+file.date_last_record+' Ref.: '+file.ref);

                        // 7 - GET THE LIST OF CONTENTS PER FILE
                        var contentHeadersSettings = new Settings("/files/"+file.id+"/contents?format=json");
                        //var contentHeadersSettings = new Settings("/files/"+fixedFileID+"/contents?format=json");
                        request(contentHeadersSettings, function (error, response, contentheadersString) { // call 5: list all content headers for all files
                            var contentHeaders = JSON.parse(contentheadersString);
                            //console.log(contentHeaders[1].id);

                            // 8 - DO SOMETHING FOR EACH FOUND CONTENT HEADER IN THE LIST
                            contentHeaders.forEach(function(content) {

                                // 9 - GET THE DETAILS FOR EACH CONTENT AND WRITE TO THE DB
                                var contentSettings = new Settings("/files/"+file.id+"/contents/"+content.id+"?format=json");
                                //var contentSettings = new Settings("/files/"+fixedFileID+"/contents/"+content.id+"?format=json");
                                request(contentSettings, function(error, response, contentString) {
                                    var content = JSON.parse(contentString);
                                    //console.log('id: '+content.id+' RSSI: '+content.rssi);
                                    dal.insertContent(new Content(content.id, content.mac_address, content.datetime, content.rssi, content.ref));
                                    console.log('Content | ID: '+content.id+' MAC: '+content.mac_address+' Date Loaded: '+content.datetime+' RSSI: '+content.rssi+' Ref.: '+content.ref);

                                }); // end content details request
                            }); // end content header forEach
                        }); // end content header request
                    }); // end file detail request
                }); // end file headers forEach
            }); // end file headers request
        }); // end drone details request
    }); // end drones forEach
}); // end drones request

*/