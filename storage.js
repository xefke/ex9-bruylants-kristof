/**
 * Created by Xefke on 14/12/2016.
 */
//npm install mongodb --save
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/prober';
// mongo in nodeJs: http://mongodb.github.io/node-mongodb-native/2.2/
// mongo API : http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html

var dal = {

    connect: function (err, result) {
        MongoClient.connect(url, function (error, db) {
            if (error)
                throw new Error(error);
            //console.log("Connected successfully to server");
            result(db)
        });
    },
    clearDrone: function (call) {
        this.connect(null, function (db) {
            db.collection('drones').drop(function (err, result) {
                //callback(result);
                console.log("collection drones dropped");
                db.close();
            });
        })
    },
    clearFileHeaders: function (call) {
        this.connect(null, function (db) {
            db.collection('filesheaders').drop(function (err, result) {
                //callback(result);
                console.log("collection filesheaders dropped");
                db.close();
            });
        })
    },
    clearFile: function (call) {
        this.connect(null, function (db) {
            db.collection('files').drop(function (err, result) {
                //callback(result);
                console.log("collection files dropped");
                db.close();
            });
        })
    },
    clearContent: function (call) {
        this.connect(null, function (db) {
            db.collection('contents').drop(function (err, result) {
                //callback(result);
                console.log("collection contents dropped");
                db.close();
            });
        })
    },
    insertDrone: function (drone, callback) {
        this.connect(null, function (db) {
            db.collection('drones').insert(drone, function (err, result) {
                //callback(result);
                console.log('- Drone Inserted');
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
            db.collection('contents').insert(content, function (err, result) {
                //callback(result);
                console.log('- - - - Content Inserted');
                db.close();
            });
        });
    },

    getDrones: function (drones) {
        this.connect(null, function (db) {
            db.collection('drones').find({}).toArray(function(err,doc){
                drones = doc;
                db.close();
                //console.log(drones);
                return drones;
            });
            return drones;
        });
        return drones;
    },
    getDroneByID: function (id, drone) {
        this.connect(null, function (db) {
            db.collection('drones').find({_id:id}).toArray(function(err,doc){
                drone = doc;
                db.close();
                console.log(drone);
                return drone;
            });
        });
    },
    getSensors: function (drones) {
        this.connect(null, function (db) {
            db.collection('sensors').find({}).toArray(function(err,doc){
                sensors = doc;
                db.close();
                //console.log(sensors);
            });
        });
    },
    getSensorsByDroneID: function (id, sensors) {
        this.connect(null, function (db) {
            db.collection('sensors').find({droneid:id}).toArray(function(err,doc){
                sensors = doc;
                db.close();
                console.log(sensors);
            });
        });
    },
    getSensorsByID: function (id, sensor) {
        this.connect(null, function (db) {
            db.collection('sensors').find({_id:id}).toArray(function(err,doc){
                sensor = doc;
                db.close();
                console.log(sensor);
            });
        });
    },
    addSensor: function (sensor, callback) {
        this.connect(null, function (db) {
            db.collection('sensors').insert(sensor, function (err, result) {
                //callback(result);
                console.log('- Sensor Inserted');
                db.close();
            });
        });
    }
};

module.exports = dal;

/*

col.find({a:1}).limit(2).toArray(function(err, docs) {
    assert.equal(null, err);
    assert.equal(2, docs.length);
    db.close();


 col.deleteOne({a:1}, function(err, r) {
 assert.equal(null, err);
 assert.equal(1, r.deletedCount);

*/
