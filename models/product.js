// MONGOOSE
// title, price, description, imageUrl

const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    require: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);

// MONGODB

// // const mongoConnect = require("../util/database");
// const getDb = require("../util/database").getDb;
// const mongodb = require("mongodb");

// class Product {
//   constructor(title, price, description, imageUrl, id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;

//     if (this._id) {
//       dbOp = db
//         .collection("products")
//         .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this }); // '$set' mongoDb reserved name
//     } else {
//       dbOp = db.collection("products").insertOne(this);
//     }

//     return dbOp
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   // static fetchAll() {
//   //   const db = getDb();
//   //   return db
//   //     .collection("products")
//   //     .find()
//   //     .toArray()
//   //     .then((products) => {
//   //       console.log(products);
//   //       return products;
//   //     })
//   //     .catch();
//   // }

//   static async fetchAll() {
//     const db = getDb();

//     try {
//       const products = await db.collection("products").find();

//       return products.toArray();
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db
//       .collection("products")
//       .find({ _id: new mongodb.ObjectId(prodId) })
//       .next() // VERY IMPORTANT
//       .then((product) => {
//         console.log(product);
//         return product;
//       })
//       .catch((err) => console.log(err));
//   }

//   static async deleteById(prodId) {
//     const db = getDb();

//     const products = await db.collection("products");

//     products
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then((result) => {
//         console.log(result);
//       })
//       .catch((err) => console.log(err));
//   }

//   static async test(prodId) {
//     try {
//       const db = getDb();
//       // awaiting the products promise
//       const products = await db.collection("products");

//       // awaiting the specific product
//       const specificProduct = await products.find({
//         _id: new mongodb.ObjectId(prodId),
//       });

//       // awaiting procedural '.next()' to get actual data
//       const product = await specificProduct.next();
//       console.log("PRODUCT", product);
//     } catch (error) {
//       console.log(error);
//     }
//   }
// }

// module.exports = Product;

// SEQUELIZED

// const { Sequelize } = require("sequelize");
// const { DataTypes } = require("sequelize");

// const sequelize = require("../util/database");

// const Product = sequelize.define("product", {
//   id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   title: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   price: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   imageUrl: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
// });

// module.exports = Product;
