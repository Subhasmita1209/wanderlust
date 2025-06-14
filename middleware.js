const Listing=require("./models/Listing.js")
const Review=require("./models/review.js")
const {ListingSchema,reviewSchema}=require("./schema.js");
const ExpressError=require("./utils/ExpressError.js");
module.exports.isLoggedin=(req,res,next)=>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in to create listing");
       return res.redirect("/login");
    }
    next();
}
module.exports.saveredirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
}
module.exports.isOwner=async(req,res,next)=>{
      const {id}=req.params;
     let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.Curruser._id)){
        req.flash("error","you are not the owner of this listing");
       return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports. validateListing=(req,res,next)=>{
    let {error}= ListingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}
module.exports.validateReview=(req,res,next)=>{
    let {error}= reviewSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}
module.exports.isReviewAuthor=async(req,res,next)=>{
      const {id,reviewId}=req.params;
     let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.Curruser._id)){
        req.flash("error","you are not the author  of this review");
       return res.redirect(`/listings/${id}`);
    }
    next();
}