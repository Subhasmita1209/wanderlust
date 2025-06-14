const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/Listing.js");

const Mongo_url="mongodb://127.0.0.1:27017/wanderlust";

main().then((res)=>{
    console.log("connect to db");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(Mongo_url);
  
}
const initdb=async()=>{
    await Listing.deleteMany();
   initData.data= initData.data.map((obj)=>({...obj,owner:"68404ebce0a01d4667fcf488",}))
    await Listing.insertMany(initData.data);
    console.log("data was initialised");
}
initdb();