/**
 * Created by Xefke on 14/12/2016.
 */

//npm install mongodb --save
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/prober';
// mongo in nodeJs: http://mongodb.github.io/node-mongodb-native/2.2/
// mongo API : http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html

var dal = {
    db : null,
    connect: function (err, result) {
        MongoClient.connect(url, function (error, db) {
            if (error)
                throw new Error(error);
            this.db = db;
            result(db)
        });
    },

    // ================= //
    // Used in ingest.js //
    // ================= //

    // Clear the collections //
    clearDrone: function () {
        this.connect(null, function (db) {
            db.collection('drones').drop(function (err, result) {
                console.log("collection drones dropped");
                db.close();
            });
        })
    },
    clearLocation: function () {
        this.connect(null, function (db) {
            db.collection('locations').drop(function (err, result) {
                console.log("collection locations dropped");
                db.close();
            });
        })
    },
    clearFileHeaders: function () {
        this.connect(null, function (db) {
            db.collection('filesheaders').drop(function (err, result) {
                console.log("collection filesheaders dropped");
                db.close();
            });
        })
    },
    clearFile: function () {
        this.connect(null, function (db) {
            db.collection('files').drop(function (err, result) {
                console.log("collection files dropped");
                db.close();
            });
        })
    },
    clearContent: function () {
        this.connect(null, function (db) {
            db.collection('contents').drop(function (err, result) {
                console.log("collection contents dropped");
                db.close();
            });
        })
    },
    clearMeasurement: function () {
        this.connect(null, function (db) {
            db.collection('measurements').drop(function (err, result) {
                console.log("collection measurements dropped");
                db.close();
            });
        })
    },

    // Insert data //
    insertDrone: function (drone, callback) {
        this.connect(null, function (db) {
            db.collection('drones').insert(drone, function (err, result) {
                //callback(result);
                console.log('- Drone Inserted');
                db.close();
            });
        });
    },
    insertLocation: function (location, callback) {
        this.connect(null, function (db) {
            db.collection('locations').insert(location, function (err, result) {
                //callback(result);
                console.log('- Location Inserted');
                db.close();
            });
        });
    },
    insertFileHeader: function (fileheader, callback) {
        this.connect(null, function (db) {
            db.collection('filesheaders').insert(fileheader, function (err, result) {
                //callback(result);
                console.log('- - Fileheader Inserted');
                db.close();
            });
        });
    },
    insertFile: function (file, callback) {
        this.connect(null, function (db) {
            db.collection('files').insert(file, function (err, result) {
                //callback(result);
                console.log('- - - File Inserted');
                db.close();
            });
        });
    },
    insertContent: function (content, callback) {
        this.connect(null, function (db) {
            db.collection('measurements').insert(content, function (err, result) {
                //callback(result);
                console.log('- - - - Content Inserted');
                db.close();
            });
        });
    },

    // ===================== //
    // Used in distribute.js //
    // ===================== //

    // 01 Drones //
    getDrones: function (dronesCallback) {
        this.connect(null, function (db) {
            db.collection('drones').find({}).toArray(function (err, doc) {
                drones = doc;
                db.close();
                dronesCallback(drones);
            });
        });
    },
    getDroneByID: function (droneCallback, id) {
        this.connect(null, function (db) {
            db.collection('drones').find({_id: id}).toArray(function (err, doc) {
                drone = doc;
                db.close();
                droneCallback(drone);
            });
        });
    },
    getDroneByMac: function (droneCallback, mac) {
        this.connect(null, function (db) {
            db.collection('drones').find({mac: mac}).toArray(function (err, doc) {
                drone = doc;
                db.close();
                droneCallback(drone);
            });
        });
    },

    // 02 Sensors //
    getSensors: function (sensorsCallback) {
        this.connect(null, function (db) {
            db.collection('sensors').find({}).toArray(function (err, doc) {
                sensors = doc;
                db.close();
                sensorsCallback(sensors);
            });
        });
    },
    getSensorsByDroneID: function (droneSensorsCallback, id) {
        this.connect(null, function (db) {
            db.collection('sensors').find({droneid: id}).toArray(function (err, doc) {
                sensors = doc;
                db.close();
                droneSensorsCallback(sensors);
            });
        });
    },
    getSensorByID: function (sensorCallback, id) {
        this.connect(null, function (db) {
            db.collection('sensors').find({_id: id}).toArray(function (err, doc) {
                sensor = doc;
                db.close();
                //console.log(sensor);
                sensorCallback(sensor);
            });
        });
    },

    // 03 Buildings //
    insertBuilding: function (building, callback) {
        this.connect(null, function (db) {
            db.collection('buildings').insert(building, function (err, result) {
                //callback(result);
                console.log('Building Inserted');
                db.close();
            });
        });
    },
    getBuildings: function (buildingsCallback) {
        this.connect(null, function (db) {
            db.collection('buildings').find({}).toArray(function (err, doc) {
                buildings = doc;
                db.close();
                //console.log(sensors);
                buildingsCallback(buildings);
            });
        });
    },
    getBuildingByID: function (buildingCallback, id) {
        this.connect(null, function (db) {
            db.collection('buildings').find({_id: id}).toArray(function (err, doc) {
                building = doc;
                db.close();
                buildingCallback(building);
            });
        });
    },
    getBuildingByName: function (buildingCallback, name) {
        this.connect(null, function (db) {
            db.collection('buildings').find({name: name}).toArray(function (err, doc) {
                building = doc;
                db.close();
                buildingCallback(building);
            });
        });
    },
    updateBuilding: function (id, update) {
        this.connect(null, function (db) {
            db.collection('buildings').update(
                {_id : id},
                { $set : update}
            );
        })
    },
    deleteBuilding: function (id){
        this.connect(null, function (db) {
            db.collection('buildings').remove({_id: id});
            db.close();
        })
    },

    // 04 Locations //
    insertLocation: function (location, callback) {
        this.connect(null, function (db) {
            db.collection('locations').insert(location, function (err, result) {
                //callback(result);
                console.log('Location Inserted');
                db.close();
            });
        });
    },
    getLocations: function (locationsCallback) {
        this.connect(null, function (db) {
            db.collection('locations').find({}).toArray(function (err, doc) {
                locations = doc;
                db.close();
                locationsCallback(locations);
            });
        });
    },
    getLocationByID: function (locationCallback, id) {
        this.connect(null, function (db) {
            db.collection('locations').find({_id: id}).toArray(function (err, doc) {
                location = doc;
                db.close();
                locationCallback(location);
            });
        });
    },
    getLocationsByBuilding: function (locationsCallback, building) {
        this.connect(null, function (db) {
            db.collection('locations').find({building: building}).toArray(function (err, doc) {
                locations = doc;
                db.close();
                locationsCallback(locations);
            });
        });
    },
    updateLocation: function (id, update) {
        this.connect(null, function (db) {
            db.collection('locations').update(
                {_id : id},
                { $set : update}
            );
            db.close();
        })
    },
    deleteLocation: function (id){
        this.connect(null, function (db) {
            console.log(id);
            db.collection('locations').remove({_id: id});
            db.close();
        })
    },

    // 05 Courses //
    // Under Construction

    // 06 People //
    insertPeople: function (person, callback) {
        this.connect(null, function (db) {
            db.collection('people').insert(person, function (err, result) {
                //callback(result);
                console.log('Person inserted');
                db.close();
            });
        });
    },
    getPeople: function (peopleCallback) {
        this.connect(null, function (db) {
            db.collection('people').find({}).toArray(function (err, doc) {
                people = doc;
                db.close();
                peopleCallback(people);
            });
        });
    },
    getPeopleByName: function (personCallback, lastname) {
        this.connect(null, function (db) {
            db.collection('people').find({lastname: lastname}).toArray(function (err, doc) {
               person = doc;
                db.close();
                person.length === 0 ? personCallback("No person with lastname '"+lastname+"' found. Please check your spelling and try again.") : personCallback(person);
            });
        });
    },
    getPeopleByNames: function (personCallback, lastname, firstname) {
        this.connect(null, function (db) {
            db.collection('people').find({lastname: lastname, firstname: firstname}).toArray(function (err, doc) {
                person = doc;
                db.close();
                person.length === 0 ? personCallback("No person with lastname '"+lastname+"' and firstname '"+firstname+"' found. Please check your spelling and try again." +
                    " Alternatively, use ../people/name/"+lastname+" to search on lastname.") : personCallback(person);
            });
        });
    },
    getPeopleByID: function (personCallback, id) {
        this.connect(null, function (db) {
            db.collection('people').find({_id: id}).toArray(function (err, doc) {
                person = doc;
                db.close();
                personCallback(person);
            });
        });
    },
    updatePeople: function (id, update) {
        this.connect(null, function (db) {
            db.collection('people').update(
                {_id : id},
                { $set : update}
            );
        })
    }

    // 07 Events //
    // Under Construction

    // 08 Measurements //
    // Under Construction

};

module.exports = dal;

