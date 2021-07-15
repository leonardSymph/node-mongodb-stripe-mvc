const MongoClient = require("mongodb").MongoClient;

let _db;

// OLD_DB

// "mongodb://leonard:test123@test-shard-00-00.qvrsp.mongodb.net:27017,test-shard-00-01.qvrsp.mongodb.net:27017,test-shard-00-02.qvrsp.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-sfn9n3-shard-0&authSource=admin&retryWrites=true&w=majority"

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb://leonard:testpassword@cluster0-shard-00-00.qutsm.mongodb.net:27017,cluster0-shard-00-01.qutsm.mongodb.net:27017,cluster0-shard-00-02.qutsm.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-smk727-shard-0&authSource=admin&retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
    .then((client) => {
      console.log("CONNECTED");
      _db = client.db();
      callback();
    })
    .catch((err) => console.log(err));
};

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw new Error("No database found");
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;

// module.exports = mongoConnect;
