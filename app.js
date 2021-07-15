const path = require("path");
const fs = require("fs");
const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const errorController = require("./controllers/error");
// const mongoConnect = require("./util/database").mongoConnect;
const User = require("./models/user");

// process.env
console.log("NODE_ENV:", process.env.NODE_ENV);

const MONGODB_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-shard-00-00.qutsm.mongodb.net:27017,cluster0-shard-00-01.qutsm.mongodb.net:27017,cluster0-shard-00-02.qutsm.mongodb.net:27017/${process.env.MONGO_DEFAULT_DATABASE}?ssl=true&replicaSet=atlas-smk727-shard-0&authSource=admin&retryWrites=true&w=majority`;

const app = express();

// connect mongoDB session
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

// csrf
const csrfProtection = csrf();

// SSL/TLS
const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

// MULTER FILTER
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// MULTER-FILE-STORAGE
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const dateString = new Date().toISOString().replace(/:/g, "-");
    console.log(file);
    cb(null, dateString + "-" + file.originalname);
  },
});

app.set("view engine", "ejs");
app.set("views", "views");

// ROUTES IMPORTS
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// fs logs for morgan
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Helmet for setting varius headers
// official docs: https://helmetjs.github.io/
app.use(helmet());

// compression
app.use(compression());

// morgan for requests logs
app.use(morgan("combined", { stream: accessLogStream }));

// BODY PARSER - to parse from req.body
app.use(bodyParser.urlencoded({ extended: false }));

// Multer - for file uploads
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

// middleware for public file
app.use(express.static(path.join(__dirname, "public")));
// middleware for images file
app.use("/images", express.static(path.join(__dirname, "images")));

// middleware for session
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: store,
  })
);

// middleware for csrf protection
app.use(csrfProtection);
// middleware for flash
app.use(flash());

// middleware again
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // console.log(err);
      throw new Error(err);
    });
});

// middleware for variable
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// middleware where you initiate all variable users
// app.use((req, res, next) => {
//   User.findById("60d7805c5352d340f45f1b05")
//     .then((user) => {
//       console.log("HEY**", user);
//       req.user = user;
//       next();
//     })
//     .catch((err) => console.log(err));

//   // User.findByPk(1)
//   //   .then((user) => {
//   //     // console.log(user);
//   //     req.user = user;
//   //     next();
//   //   })
//   //   .catch((err) => console.log(err));
//   // next();
// });

// ROUTES
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Error-routes
app.get("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  res.redirect("/500");
});

// mongoose
mongoose
  .connect(MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
  .then((result) => {
    // User.findOne().then((userResult) => {
    //   if (!userResult) {
    //     const user = new User({
    //       name: "Leonard",
    //       email: "test@test.com",
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user.save();
    //   }
    // });

    app.listen(process.env.PORT || 3000);
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
    console.log("CONNECTED TO MONGODB");
  })
  .catch((err) => {
    console.log(err);
  });

// mongodb
// mongoConnect(() => {
//   app.listen(3000);
// });
