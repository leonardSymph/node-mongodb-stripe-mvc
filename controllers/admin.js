const Product = require("../models/product");
// const mongodb = require("mongodb");

// delete file saved with helper
const fileHelper = require("../util/file");

// validators
const { validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    // isAuthenticated: req.session.isLoggedIn,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    });
  }

  // validators
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        // imageUrl: imageUrl,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  // image URL
  const imageUrl = image.path;
  console.log(imageUrl);

  console.log("THIS_PRODUCT**", Product);

  // mongoose
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.session.user,
  });

  // mongodb
  // const product = new Product(
  //   title,
  //   price,
  //   description,
  //   imageUrl,
  //   null,
  //   req.user._id
  // );

  // const product = new Product(null, title, imageUrl, description, price);
  // product
  //   .save()
  //   .then(() => {
  //     res.redirect('/');
  //   })
  //   .catch(err => console.log(err));
  // req.user
  //   .createProduct({
  //     title: title,
  //     price: price,
  //     imageUrl: imageUrl,
  //     description: description,
  //   })
  // Product.create({
  //   title: title,
  //   price: price,
  //   imageUrl: imageUrl,
  //   description: description,
  // })

  product
    .save()
    .then((result) => {
      res.redirect("/admin/products");
      console.log(result);
      console.log("Created Product");
    })
    .catch((err) => {
      // console.log(err);
      // res.redirect("/500");
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const prodId = req.params.productId;

  try {
    const product = await Product.findById(prodId);
    // throw new Error("Dummy");

    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
      // isAuthenticated: req.session.isLoggedIn,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  // const editMode = req.query.edit;
  // if (!editMode) {
  //   return res.redirect("/");
  // }
  // const prodId = req.params.productId;
  // req.user
  //   .getProducts({ where: { id: prodId } })
  //   // Product.findByPk(prodId)
  //   .then((products) => {
  //     const product = products[0];
  //     if (!product) {
  //       return res.redirect("/");
  //     }
  //     res.render("admin/edit-product", {
  //       pageTitle: "Edit Product",
  //       path: "/admin/edit-product",
  //       editing: editMode,
  //       product: product,
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  // const updatedImageUrl = req.body.imageUrl;
  const image = req.file;
  const updatedDesc = req.body.description;

  // validators
  const errors = validationResult(req);
  console.log(updatedTitle);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        // imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  // mongoose
  Product.findById(prodId)
    .then((product) => {
      if (String(product.userId) !== String(req.user._id)) {
        console.log("REDIRECTED");
        return res.redirect("/");
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;

      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }

      return product.save().then((result) => {
        console.log("RESULT**", result);
        console.log("Updated Product");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // const updatedProduct = new Product(
  //   prodId,
  //   updatedTitle,
  //   updatedImageUrl,
  //   updatedDesc,
  //   updatedPrice
  // );
  // updatedProduct.save();

  // mongodb
  // const product = new Product(
  //   updatedTitle,
  //   updatedPrice,
  //   updatedDesc,
  //   updatedImageUrl,
  //   prodId
  // );

  // product
  //   .save()
  //   .then((result) => {
  //     console.log("UPDATED PRODUCTS");
  //     res.redirect("/admin/products");
  //   })
  //   .catch((error) => console.log(error));

  // Product.findByPk(prodId)
  //   .then((product) => {
  //     product.title = updatedTitle;
  //     product.price = updatedPrice;
  //     product.imageUrl = updatedImageUrl;
  //     product.desc = updatedDesc;
  //     return product.save();
  //   })
  //   .then((result) => {
  //     console.log(result);
  //     res.redirect("/admin/products");
  //   })
  //   .catch((err) => console.log(err));
};

exports.getProducts = async (req, res, next) => {
  // mongoose
  const products = await Product.find({ userId: req.user._id });

  // const testproducts = await Product.find()
  //   .select("title price _id")
  //   .populate("userId", "cart");

  res.render("admin/products", {
    prods: products,
    pageTitle: "Admin Products",
    path: "/admin/products",
    // isAuthenticated: req.session.isLoggedIn,
  });

  // mongodb
  // const products = await Product.fetchAll();

  // res.render("admin/products", {
  //   prods: products,
  //   pageTitle: "Admin Products",
  //   path: "/admin/products",
  // });

  // req.user
  //   .getProducts()
  //   // Product.findAll()
  //   .then((products) => {
  //     res.render("admin/products", {
  //       prods: products,
  //       pageTitle: "Admin Products",
  //       path: "/admin/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));

  // Product.fetchAll((products) => {
  //   res.render("admin/products", {
  //     prods: products,
  //     pageTitle: "Admin Products",
  //     path: "/admin/products",
  //   });
  // });
};



exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found"));
      }
      // delete File using fs.unlink()
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    // mongoose
    .then(() => {
      console.log("PRODUCT DESTROYED");
      // res.redirect("/admin/products");
      res.status(200).json({
        message: 'successfully deleted'
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json({
        message: 'failed to delete'
      })
    });

};

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;

//   Product.findById(prodId)
//     .then((product) => {
//       if (!product) {
//         return next(new Error("Product not found"));
//       }
//       // delete File using fs.unlink()
//       fileHelper.deleteFile(product.imageUrl);
//       return Product.deleteOne({ _id: prodId, userId: req.user._id });
//     })
//     // mongoose
//     .then(() => {
//       console.log("PRODUCT DESTROYED");
//       res.redirect("/admin/products");
//     })
//     .catch((err) => console.log(err));

//   // mongodb
//   // Product.deleteById(prodId);
//   // Product.deleteById(prodId)
//   //   .then(() => {
//   //     console.log("PRODUCT DESTROYED");
//   //     res.redirect("/admin/products");
//   //   })
//   //   .catch((err) => console.log(err));

//   // const prodId = req.body.productId;
//   // // Product.deleteById(prodId);
//   // Product.findByPk(prodId)
//   //   .then((product) => {
//   //     return product.destroy();
//   //   })
//   //   .then((result) => {
//   //     console.log("PRODUCT DESTROYED");
//   //     res.redirect("/admin/products");
//   //   })
//   //   .catch((err) => console.log(err));
// };
