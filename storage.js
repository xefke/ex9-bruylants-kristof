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

    getDrones: function () {

        this.connect(null, function (db) {

            var allDrones = db.collection('drones');
            console.log(allDrones);
            db.close();
        });
    }
};

module.exports = dal;