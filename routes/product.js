const express = require('express')
const {getProducts, newProduct, getSingleProduct,updateProduct,deleteProduct, createReview, getReviews, deleteReview}=require('../controllers/productController')
const router =express.Router();
const {isAuthenticatedUser, authorizeRoles}=require('../middlewares/authenticate');
const { updateProfile } = require('../controllers/authController');
router.route('/products').get(getProducts);
router.route('/product/new').post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.route('/product/:id').get(getSingleProduct); 
router.route('/product/:id').put(updateProduct);  
router.route('/product/:id').delete(deleteProduct); 
router.route('/review').put(isAuthenticatedUser,createReview)
router.route('/review').get(isAuthenticatedUser,getReviews)
router.route('/review').delete(isAuthenticatedUser,deleteReview)
//admin     
router.route('/admin/product/new').post(isAuthenticatedUser,authorizeRoles('admin'),newProduct);     
module.exports=router         