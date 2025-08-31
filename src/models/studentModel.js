const connectDB = require("../connection/conn");

async function getStudentCollection(){
    const db = await connectDB();
    return db.collection("students");
}

module.exports = getStudentCollection;
