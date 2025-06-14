const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const Review =require("../models/review.js");
const {validateReview,isLoggedin,isReviewAuthor}=require("../middleware.js")
const Listing=require("../models/Listing.js");
const reviewsController=require("../controller/reviews.js")

router.post("/",isLoggedin,validateReview,wrapAsync(reviewsController.createReview));

//delete review
router.delete("/:reviewId",isLoggedin,isReviewAuthor,wrapAsync(reviewsController.Destroyreview))
module.exports=router;
