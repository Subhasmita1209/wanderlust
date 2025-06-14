const express=require("express");
const router=express.Router();
const ExpressError=require("../utils/ExpressError.js");
const wrapAsync=require("../utils/wrapAsync.js");
const { isLoggedin,isOwner,validateListing } = require("../middleware.js");
const Listingcontroller=require("../controller/listings.js")
const multer  = require('multer')
const {storage}=require("../cloudConfig.js")
const upload = multer({storage })

router.get("/api/search/suggestions", wrapAsync(Listingcontroller.searchSuggestions));

router.route("/")
.get(wrapAsync(Listingcontroller.index))
.post(isLoggedin,upload.single("listing[image]"),
(req,res,next)=>{
    if(req.file){
        req.body.listing.image={url:req.file.path};
    }
    next();
},
    validateListing,wrapAsync(Listingcontroller.createListing))

router.get("/new", isLoggedin,Listingcontroller.randerNewform);

router.route("/:id")
.get(wrapAsync(Listingcontroller.ShowListing))
.put(isLoggedin,isOwner,
    upload.single("listing[image]"),
(req,res,next)=>{
    if(req.file){
        req.body.listing.image={url:req.file.path};
    }
    next();
},
    validateListing,wrapAsync(Listingcontroller.updateListing))
.delete(isLoggedin,isOwner,wrapAsync(Listingcontroller.DeleteListing))


router.get("/:id/edit",isLoggedin,isOwner,wrapAsync(Listingcontroller.randerEditform))


module.exports=router;