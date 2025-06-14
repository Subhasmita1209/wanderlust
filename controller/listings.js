const Listing=require("../models/Listing.js")
const axios=require("axios");
const mapToken=process.env.MAP_TOKEN;
module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("./listings/index.ejs",{allListings});
}
module.exports.randerNewform=(req,res)=>{
  res.render("./listings/new.ejs")
}
module.exports.ShowListing=async(req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findById(id).populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    }).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!")
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing})
}
module.exports.createListing=async(req,res)=>{

  const location = req.body.listing.location;
  const apiKey = mapToken;
  let response;

  try {
     response = await axios.get("https://api.maptiler.com/geocoding/" + encodeURIComponent(location) + ".json", {
      params: {
        key: apiKey,
        limit: 1
      }
    });
 if (response.data.features.length === 0) {
      req.flash("error", "Invalid location — unable to geocode.");
      return res.redirect("/listings/new");
    }
  
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    res.status(500).send("Geocoding failed");
  }
    let url=req.file.path;
    let filename=req.file.filename;
    let newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    newListing.geometry= response.data.features[0].geometry;
    let savedListing=await newListing.save();
    console.log(savedListing);
     req.flash("success","New listing created");
    res.redirect("/listings");
}
module.exports.randerEditform=async(req,res,next)=>{
    const {id}=req.params;
    let listing=await Listing.findById(id);
    if(!listing){
  req.flash("error", "listing you requested for does not exist!");
  res.redirect("/listings");
    }
   let originalImageurl=listing.image.url;
     originalImageurl= originalImageurl.replace("/upload","/upload/w_250")
    res.render("./listings/edit.ejs",{listing,originalImageurl});
}
module.exports.updateListing=async(req,res)=>{
    if(!req.body.listing){
        throw new ExpressError(400,"send valid data for listing");
    }
    const {id}=req.params;
  let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing});
     if(typeof req.file!=="undefined"){
        let url=req.file.path;
      let filename=req.file.filename;
      listing.image={url,filename};
       await listing.save()
     }
     
     req.flash("success"," listing updated");
    res.redirect(`/listings/${id}`);
}
module.exports.DeleteListing=async(req,res)=>{
    const {id}=req.params;
    let Deletedlisting=await Listing.findByIdAndDelete(id);
    console.log(Deletedlisting);
     req.flash("success"," listing deleted");
    res.redirect("/listings");
}

module.exports.searchSuggestions = async (req, res) => {
    try {
        const query = req.query.q || '';
        if (query.length < 2) {
            return res.json([]);
        }

        const locations = await Listing.aggregate([
            {
                $match: {
                    $or: [
                        { location: { $regex: query, $options: 'i' } },
                        { title: { $regex: query, $options: 'i' } }
                    ]
                }
            },
            {
                $group: {
                    _id: '$location',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    location: '$_id'
                }
            }
        ]);

        res.json(locations.map(item => item.location));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Updated index method to handle searches
module.exports.index = async (req, res) => {
    try {
        const { location } = req.query;
        let query = {};
        
        if (location) {
            query = { 
                $or: [
                    { location: { $regex: location, $options: 'i' } },
                    { title: { $regex: location, $options: 'i' } }
                ]
            };
        }
        
        const allListings = await Listing.find(query);
        res.render("listings/index", { allListings });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};