const {MongoClient} = require("mongodb");
const connectionString = process.env.MONGO_URI;

if(!connectionString) throw new Error("MONGO_URI is not defined in .env file")

const client = new MongoClient(connectionString);
let db;

async function connectDB(){
    if(db) return db; 
    try{
        await client.connect();
        db = client.db("temp"); 
        console.log("Connected to MongoDB");
        return db;
    } 
    catch(err){
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
}

module.exports = connectDB;
