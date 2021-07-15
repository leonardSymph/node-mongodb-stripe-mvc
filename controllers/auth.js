const crypto = require("crypto");

const bcryptjs = require("bcryptjs");
const nodemailer = require("nodemailer");
// const sendgridTransport = require("nodemailer-sendgrid-transport");

// validator
const { validationResult } = require("express-validator");

const User = require("../models/user");

// sendgrid nodemailer
// const transporter = nodemailer.createTransport(sendgridTransport({
//   auth: {
//     api_user: ,
//     api_key:
//   }
// }))

// GETLOGIN
exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  // CLIENT-SIDE COOKIES
  //   const cookieArray = req.get("Cookie").split(";");

  //   // extracting the isLoggedIn in cookies
  //   let loggedInIndex;
  //   cookieArray.forEach((item, i) => {
  //     if (item.includes("loggedIn")) {
  //       loggedInIndex = i;
  //     }
  //   });

  //   const isLoggedIn = cookieArray[loggedInIndex].split("=")[1];

  // SESSIONS

  console.log("SESSION", req.session.isLoggedIn);
  console.log("SESSION-USER", req.session.user);

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

// GETSIGNUP
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

// POSTLOGIN
exports.postLogin = (req, res, next) => {
  // auth
  const email = req.body.email;
  const password = req.body.password;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: error.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: error.array(),
    });
  }

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      req.flash("error", "invalid email or password");
      return res.redirect("/login");
    }

    bcryptjs
      .compare(password, user.password)
      .then((doMatch) => {
        if (doMatch) {
          req.session.user = user;
          req.session.isLoggedIn = true;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }
        req.flash("error", "Invalid email or password");
        res.redirect("/login");
      })
      .catch((err) => {
        console.log(err);
        res.redirect("/login");
      });
  });

  // mongoose
  // User.findById("60d7805c5352d340f45f1b05")
  //   .then((user) => {
  //     console.log("USER**", user);
  //     req.session.user = user;
  //     req.session.isLoggedIn = true;
  //     req.session.save((err) => {
  //       console.log(err);
  //       res.redirect("/");
  //     });
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });

  // cookie
  //   res.setHeader("Set-Cookie", "loggedIn=true");
  //   req.session.isLoggedIn = true;
};

// POSTSIGNUP
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // validator
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: error.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: error.array(),
    });
  }

  bcryptjs
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {
          items: [],
        },
      });
      return user.save();
    })
    .then((result) => {
      console.log(result);
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};

// POSTLOGOUT
exports.postLogout = (req, res, next) => {
  console.log("LOGOUT");
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        console.log(result);

        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: {
            user: "dindo.test@gmail.com",
            pass: "dindogwapo24",
          },
        });

        res.redirect("/");

        transporter
          .sendMail({
            from: "dindo.test@gmail.com",
            to: req.body.email,
            subject: "Hello",
            text: "Testing",
            html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `,
          })
          .then((sendMailResult) => console.log("SENT", sendMailResult))
          .catch((mailError) => console.log(mailError));
      })
      .catch((userError) => {
        console.log(userError);
        const error = new Error(userError);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      console.log(user);

      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  console.log(newPassword, userId, passwordToken);

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      console.log("POST_NEWPASSWORD_USER", user);
      resetUser = user;
      return bcryptjs.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      console.log("HASHED**", hashedPassword);
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;
      resetUser.save();
    })
    .then((result) => {
      console.log("SUCCESS**", result);
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
