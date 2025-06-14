if(process.env.NODE_ENV  != "production"){
 require('dotenv').config()
}


const express=require("express")
const cors = require('cors');
const app=express();
const ejs=require("ejs")

const mongoose=require("mongoose");
const path=require("path");
const ExpressError=require("./utils/ExpressError.js");
const methodOverride = require('method-override');
const session=require("express-session");
const MongoStore = require('connect-mongo');

const ejsMate=require("ejs-mate");
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/reviews.js");
const userRouter=require("./routes/user.js");
const flash=require("connect-flash");
const passport=require("passport");
const Localstrategy=require("passport-local");
const User=require("./models/user.js");
app.use(cors());

app.set("view engine","ejs");

app.set("views",path.join(__dirname,"views"));

const dbUrl=process.env.ATLASDB_URL;
app.use(express.urlencoded({extended:true}));

app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,"./public")))


app.engine('ejs', ejsMate);
main().then((res)=>{
    console.log("connect to db");
})
.catch(err => console.log(err));

async function main() {
 
  await mongoose.connect(dbUrl);

}
const store=MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
     secret:process.env.SECRET,
  },
  touchAfter:24*3600,
  
});
store.on("error",()=>{
  console.log("ERROR IN MONGO SESSION STORE",err)
})
const sessionOption={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  }
}

   

// app.get("/",(req,res)=>{
//     res.send("working successully");
// })
app.use(session(sessionOption));
 app.use(flash());
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new Localstrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
 app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.Curruser=req.user;
    next();
 })


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter)

app.all("*",(req,res,next) => {
    next(new ExpressError(404,"page not found!"));
 });


app.use((err,req,res,next)=>{
    const {statusCode=500,message="Something went wrong"}= err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
    
})

app.listen(8080,()=>{
    console.log("server is listening to the port 8080")
})