var express = require('express');
const session = require('express-session');
const async = require('hbs/lib/async');
const { render } = require('../app');
var router = express.Router();
var productHelpers = require('../helpers/product-helpers')
var userHelpers = require('../helpers/user-helpers')
const verifyadminLogin = (req, res, next) => {
  if (req.session.adminLoggedIn)
    next()
  else
    res.redirect('/admin/adminlogin')
}
/* GET users listing. */
router.get('/',  function (req, res, next) {
  let admin = req.session.admin
  productHelpers.getAllProducts().then((products) => {
    res.render('admin/view-products', { admin: true, products});
  })
});
router.get('/add-product',verifyadminLogin,  function (req, res) {
  res.render('admin/add-product', { admin: true })
})
router.get('/adminlogin', (req, res) => {
  console.log(req.session.adminLoggedIn)
  console.log(req.session.admin)
  if (req.session.adminLoggedIn)
    res.redirect('/')
  else {
    res.render('admin/admin-login', { "loginErr": req.session.adminLoginErr })
    req.session.adminLoginErr = false
  }
});
router.post('adminlogin', (req, res) => {
  userHelpers.doLogin(req, res).then((response) => {
    console.log("Ad status"+response.adminStatus);
    console.log(response.admin);
    if (response.adminStatus) {
      req.session.admin = response.admin
      req.session.adminLoggedIn = true 
      res.redirect('/admin')
    }
    else {
      req.session.adminLoginErr = true
      res.redirect('admin/adminlogin')
    }
  })
})
router.post('/add-product', (req, res) => {
  productHelpers.addproduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv('./public/product-images/' + id + '.jpg', (err, data) => {
      if (!err) {
        res.render("admin/add-product")
      }
      else
        console.log(err);
    })
  })
})
router.get('/admin-login', (req, res) => {
  if (req.session.userLoggedIn)
    res.redirect('/admin/view-products')
  else {
    res.render('admin/admin-login', { "loginErr": req.session.userLoginErr })
    req.session.userLoginErr = false
  }
});
router.get('/delete-product/:id',  (req, res) => {
  let proId = req.params.id
  productHelpers.deleteProduct(proId).then((response) => {
    if (response) {
      fs.unlink('./public/product-images/' + proID + '.jpg', () => {
        res.redirect('/admin')
      })
    }
  })
})
router.get('/edit-product/:id',  async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product })

})
router.post('/edit-product/:id', (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let id = req.params.id
      let image = req.files.Image;
      image.mv('./public/product-images/' + id + '.jpg')
    }
  })
})
router.get('/all-orders', async (req, res) => {
  let orders = await productHelpers.getAllPlacedOrders()
  console.log(orders);
  res.render('admin/all-orders', { admin: true, orders })
})
router.get('/ship-product/:id',  (req, res) => {
  productHelpers.shipProduct(req.params.id).then(() => {
    res.redirect('/admin/all-orders')
  })
})
module.exports = router;
