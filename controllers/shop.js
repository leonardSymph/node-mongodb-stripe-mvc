const fs = require("fs");
const path = require("path");

// stripe payment
const stripe = require('stripe')(process.env.STRIPE_KEY)

// PDFKIT
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");
const product = require("../models/product");
// const Cart = require("../models/cart");
// const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;

  let totalItems;

  // mongoose
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        // totalProducts: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        // isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // mongodb
  // Product.fetchAll()
  //   .then((result) => {
  //     // console.log("TEST", result);
  //     res.render("shop/product-list", {
  //       prods: result,
  //       pageTitle: "All Products",
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));
  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render("shop/product-list", {
  //       prods: rows,
  //       pageTitle: "All Products",
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  // Product.test(prodId);

  // mongodb && mongoose findById()
  Product.findById(prodId)
    .then((product) => {
      // console.log("TEST", product);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // Product.findByPk(prodId)
  //   .then((product) => {
  //     console.log("TEST", product);
  //     res.render("shop/product-detail", {
  //       product: product,
  //       pageTitle: product.title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));

  // Product.findAll({
  //   where: {
  //     id: prodId,
  //   },
  // })
  //   .then((product) => {
  //     res.render("shop/product-detail", {
  //       product: product[0],
  //       pageTitle: product[0].title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));

  // Product.findById(prodId)
  //   .then(([product]) => {
  //     res.render("shop/product-detail", {
  //       product: product[0],
  //       pageTitle: product.title,
  //       path: "/products",
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;

  let totalItems;

  // mongoose
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        // totalProducts: totalItems,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
        // isAuthenticated: req.session.isLoggedIn,
        // csrfToken: req.csrfToken(),
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // mongodb
  // Product.fetchAll()
  //   .then((result) => {
  //     res.render("shop/index", {
  //       prods: result,
  //       pageTitle: "Shop",
  //       path: "/",
  //     });
  //   })
  //   .catch((err) => console.log(err));

  // Product.fetchAll()
  //   .then(([rows, fieldData]) => {
  //     res.render("shop/index", {
  //       prods: rows,
  //       pageTitle: "Shop",
  //       path: "/",
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getCart = (req, res, next) => {
  // mongoose

  console.log("REQSESSION", req.user);

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      const products = user.cart.items;

      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      console.log("ERROR HERE", error)
      return next(error);
    });

  // mongodb

  // req.user
  //   .getCart()
  //   .then((products) => {
  //     console.log(products);
  //     res.render("shop/cart", {
  //       path: "/cart",
  //       pageTitle: "Your Cart",
  //       products: products,
  //     });
  //   })
  //   .catch((err) => console.log(err));

  // sequelize
  // console.log(req.user.cart);
  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     console.log(cart);
  //     return cart
  //       .getProducts()
  //       .then((products) => {
  //         res.render("shop/cart", {
  //           path: "/cart",
  //           pageTitle: "Your Cart",
  //           products: products,
  //         });
  //       })
  //       .catch((err) => console.log(err));
  //   })
  //   .catch((err) => console.log(err));

  // Cart.getCart((cart) => {
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     for (let product of products) {
  //       const cartProductData = cart.products.find(
  //         (prod) => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }
  //     res.render("shop/cart", {
  //       path: "/cart",
  //       pageTitle: "Your Cart",
  //       products: cartProducts,
  //     });
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // let fetchedCart;
  // let newQuantity = 1;

  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;

  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((products) => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findByPk(prodId);
  //   })
  //   .then((product) => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity },
  //     });
  //   })
  //   .then(() => {
  //     res.redirect("/cart");
  //   })
  //   .catch((err) => console.log(err));

  // Product.findById(prodId, (product) => {
  //   Cart.addProduct(prodId, product.price);
  // });
  // res.redirect("/cart");
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .removeItemFromCart(prodId)
    .then((result) => {
      console.log("Removed item");
      res.redirect("./cart");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     console.log("HERE CART", cart);
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then((products) => {
  //     console.log("HERE ***", products);
  //     const product = products[0];
  //     return product.cartItem.destroy();
  //   })
  //   .then((result) => {
  //     res.redirect("./cart");
  //   })
  //   .catch((err) => console.log(err));

  // Product.findById(prodId, (product) => {
  //   Cart.deleteProduct(prodId, product.price);
  //   res.redirect("/cart");
  // });
};


exports.getCheckoutSuccess = (req, res, next) => {

  // mongoose
  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log("USER**", user.cart.items);
      const products = user.cart.items.map((item) => {
        return {
          quantity: item.quantity,
          product: { ...item.productId._doc },
        };
      });

      console.log("ALL-ORDER", products);

      const order = new Order({
        user: {
          // name: req.sesion.user.name,
          email: req.user.email,
          userId: req.user._id,
        },
        products: products,
      });

      return order.save();
    })
    .then((result) => {
      req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.postOrder = (req, res, next) => {
  // mongoose

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      console.log("USER**", user.cart.items);
      const products = user.cart.items.map((item) => {
        return {
          quantity: item.quantity,
          product: { ...item.productId._doc },
        };
      });

      console.log("ALL-ORDER", products);

      const order = new Order({
        user: {
          // name: req.sesion.user.name,
          email: req.user.email,
          userId: req.user._id,
        },
        products: products,
      });

      return order.save();
    })
    .then((result) => {
      req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // mongodb

  // req.user
  //   .addOrder()
  //   .then((result) => {
  //     res.redirect("/orders");
  //   })
  //   .catch((err) => console.log(err));

  // let fetchedCart;

  // req.user
  //   .getCart()
  //   .then((cart) => {
  //     fetchedCart = cart;
  //     return cart.getProducts();
  //   })
  //   .then((products) => {
  //     return req.user
  //       .createOrder()
  //       .then((order) => {
  //         return order.addProducts(
  //           products.map((product) => {
  //             product.orderItem = { quantity: product.cartItem.quantity };
  //             return product;
  //           })
  //         );
  //       })
  //       .catch((err) => console.log(err));
  //   })
  //   .then((result) => {
  //     fetchedCart.setProducts(null);
  //   })
  //   .then((result) => {
  //     res.redirect("/orders");
  //   })
  //   .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  // mongoose

  Order.find({ "user.userId": req.user._id }).then((orders) => {
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: orders,
      // isAuthenticated: req.session.isLoggedIn,
    });
  });

  // mongodb

  // req.user
  //   .getOrders()
  //   .then((orders) => {
  //     console.log("HEYSUP**", orders);
  //     res.render("shop/orders", {
  //       path: "/orders",
  //       pageTitle: "Your Orders",
  //       orders: orders,
  //     });
  //   })
  //   .catch((err) => console.log(err));

  // req.user
  //   .getOrders({ include: ["products"] })
  //   .then((orders) => {
  //     res.render("shop/orders", {
  //       path: "/orders",
  //       pageTitle: "Your Orders",
  //       orders: orders,
  //     });
  //   })
  //   .catch((err) => console.log(err));
};

exports.getCheckout = (req, res, next) => {

  let products;
  let total = 0

  req.user
    .populate("cart.items.productId")
    .execPopulate()
    .then((user) => {
      
      products = user.cart.items;
      total = 0;

      products.forEach(p=>{
        total += p.quantity * p.productId.price
      })

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map((p)=>{

          return {
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity

          }
        }),
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http://localhost:3000
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
      });

    })
    .then(session=>{
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      console.log(invoiceName);

      // pdfkit
      const pdfDoc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Dispostion",
        'inline; fileName="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("------------------------------");

      let totalPrice = 0;

      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;

        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });

      pdfDoc.text("---");

      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

      pdfDoc.end();

      // FOR SIMPLE PDF BROWSER
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }

      //   console.log("HERE*", data);

      //   res.setHeader("Content-Type", "application/pdf");
      //   res.setHeader(
      //     "Content-Disposition",
      //     'inline; fileName="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });

      // FOR STEAMING PDF
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader("Content-Type", "application/pdf");
      // res.setHeader(
      //   "Content-Dispostion",
      //   'inline; fileName="' + invoiceName + '"'
      // );

      // file.pipe(res);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
