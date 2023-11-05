var express = require('express');
const session = require('express-session');
const async = require('hbs/lib/async');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var userHelpers = require('../helpers/user-helpers')
const verifyLogin = (req, res, next) => {
  if (req.session.userLoggedIn)
    next()
  else
    res.redirect('/login')
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let user = req.session.user
  let cartCount = null
  if (req.session.userLoggedIn) {
    cartCount = await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products) => {
    res.render('user/index', { products, user, cartCount });
  })
});
router.get('/login', (req, res) => {
  if (req.session.userLoggedIn)
    res.redirect('/')
  else {
    res.render('user/login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }
});
router.get('/signup', (req, res) => {
  res.render('user/signup')
});
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req, res).then((response) => {
    req.session.user = response
    req.session.userLoggedIn = true
    res.redirect('/')
  })
})
router.post('/login', (req, res) => {
  userHelpers.doLogin(req, res).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.userLoggedIn = true
      res.redirect('/')
    }
    else {
      req.session.userLoginErr = true
      res.redirect('/login')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})
router.get('/cart', verifyLogin, async (req, res) => {
  let products = await userHelpers.getCartProducts(req.session.user._id)
  if (products.length != 0) {
    let totalValue = await userHelpers.getTotalAmt(req.session.user._id)
    res.render('user/cart', { products, user: req.session.user, totalValue, proAvail: true })
  } else {
    res.render('user/cart', { user: req.session.user })
  }
})
router.get('/add-to-cart/:id', (req, res) => {
  console.log("api call");
  userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })
  })
})
router.post('/change-product-quantity', async (req, res) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmt(req.body.user)
    res.json(response)
  })
})
router.post('/cart-remove', (req, res) => {
  userHelpers.removeFromCart(req.body).then((response) => {
    res.json(response)
  })
})
router.get('/place-order', verifyLogin, async (req, res) => {
  let cartItems = await userHelpers.getCartProducts(req.session.user._id)
  if (cartItems.length > 0) {
    let total = await userHelpers.getTotalAmt(req.session.user._id)
    res.render('user/place-order', { total, user: req.session.user })
  } else {
    res.redirect('/')
  }
})
router.post('/place-order', async (req, res) => {
  let products = await userHelpers.getCartProductList(req.body.userId)
  let totalPrize = await userHelpers.getTotalAmt(req.body.userId)
  userHelpers.placeOrder(req.body, products, totalPrize).then((orderId) => {
    if (req.body['payment-method'] === 'COD') {
      res.json({ codSuccess: true })
    } else {
      userHelpers.generateRazorpay(orderId, totalPrize).then((response) => {
        console.log(response);
        res.json(response)
      })
    }
  })
  console.log(req.body);
})
router.get('/orders', verifyLogin, async (req, res) => {
  let orders = await userHelpers.getAllOrders(req.session.user._id)
  if (orders.length != 0) {
    res.render('user/orders', { user: req.session.user, orders, orderAvail: true })
  } else {
    res.render('user/orders', { user: req.session.user })
  }
})
router.get('/view-order-products/:id', async (req, res) => {
  let products = await userHelpers.getOrderProducts(req.params.id)
  res.render('user/viewOrderProducts', { user: req.session.user, products })
})
router.post('/verify-payment', (req, res) => {
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
      res.json({ status: true })
    })
  }).catch((err) => {
    console.log(err);
    res.json({ status: false, errMsg: '' })
  })
})
module.exports = router;
