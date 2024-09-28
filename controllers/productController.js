const Product=require('../models/productModel')
const ErrorHandler=require('../utils/errorHandler')
const APIFeatures=require('../utils/apiFeatures')
const catchAsyncError = require("../middlewares/catchAsyncError");
exports.getProducts = async (req,res,next)=>{
    const resultPage=4;
   const apiFeatures= new APIFeatures(Product.find(),req.query).search().filter().paginate(resultPage);
   
    const products=await apiFeatures.query;
    res.status(200).json({ 
        success:true, 
        count:products.length,
       products
    })  
}
exports.newProduct=async (req,res,next)=>{
    req.body.user=req.user.id;  
   const product=await Product.create(req.body);
   res.status(201).json({  
    success:true, 
     product 

   })
} 

exports.getSingleProduct=async(req,res,next)=>{
const product=  await Product.findById(req.params.id);
     if(!product)
     {
      
      return next(new ErrorHandler('product not found',400) )
     }
     res.status(201).json({
        success:true,
        product
     })
}
exports.updateProduct=async(req,res,next)=>{
 let product= await Product.findById(req.params.id);
 if(!product)
    {
     return  res.status(404).json({
           success:false,
           message:"PRODUCT not found"
       })
    }
   product= await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        product
    })

}
exports.deleteProduct = async (req, res, next) =>{
    const product = await Product.findById(req.params.id);

    if(!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    await product.deleteOne();
 
    res.status(200).json({
        success: true,
        message: "Product Deleted!"   
    }) 
 
}
//Create Review - api/v1/review
exports.createReview = catchAsyncError(async (req, res, next) =>{
    const  { productId, rating, comment } = req.body;

    const review = {
        user : req.user.id,
        rating,
        comment
    }

    const product = await Product.findById(productId);
   //finding user review exists
    const isReviewed = product.reviews.find(review => {
       return review.user.toString() == req.user.id.toString()
    })

    if(isReviewed){
        //updating the  review
        product.reviews.forEach(review => {
            if(review.user.toString() == req.user.id.toString()){
                review.comment = comment
                review.rating = rating
            }

        })

    }else{
        //creating the review
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }
    //find the average of the product reviews
    product.ratings = product.reviews.reduce((acc, review) => {
        return review.rating + acc;
    }, 0) / product.reviews.length;
    product.ratings = isNaN(product.ratings)?0:product.ratings;

    await product.save({validateBeforeSave: false});

    res.status(200).json({
        success: true
    })


})
//Get Reviews - api/v1/reviews?id={productId}
exports.getReviews = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findById(req.query.id).populate('reviews.user','name email');

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})
//Delete Review - api/v1/review
exports.deleteReview = catchAsyncError(async (req, res, next) =>{
    const product = await Product.findById(req.query.productId);
    
    //filtering the reviews which does match the deleting review id
    const reviews = product.reviews.filter(review => {
       return review._id.toString() !== req.query.id.toString()
    });
    //number of reviews 
    const numOfReviews = reviews.length;
    let ratings = reviews.reduce((acc, review) => {
        return review.rating + acc;
    }, 0) / reviews.length;
    ratings = isNaN(ratings)?0:ratings;

    //save the product document
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        numOfReviews, 
        ratings
    })
    res.status(200).json({
        success: true
    })


});