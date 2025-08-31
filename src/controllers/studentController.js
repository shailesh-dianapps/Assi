const bcrypt = require("bcryptjs");
const {ObjectId} = require("mongodb");
const getStudentCollection = require("../models/studentModel");


async function signup(req, res){
    try{
        const students = await getStudentCollection();
        const {first_name, last_name, age, gender, phone, password, email} = req.body;

        if(!first_name || !last_name || !gender || !age || !email || !phone || !password){
            return res.status(400).json({error: "All fields are required."});
        }

        if(age<=1 || age>=100) return res.status(400).json({error: "Age must be between 2 and 99."});

        let genders = ["M", "F", "Others"];
        if(!genders.includes(gender)) return res.status(400).json({error: "Invalid gender."});

        const nameRegex = /^[a-zA-Z'-]{2,50}$/;
        if(!nameRegex.test(first_name) || !nameRegex.test(last_name)){
            return res.status(400).json({error: "Invalid name format."});
        }

        const phoneRegex = /^(?:\+91|91)?[789]\d{9}$/;
        if(!phoneRegex.test(phone)) return res.status(400).json({error: "Invalid phone format."});

        const emailRegex = /^[A-Za-z0-9._%+-]{2,}@[A-Za-z0-9.-]{2,}\.[A-Za-z]{2,}$/;
        if(!emailRegex.test(email)) return res.status(400).json({error: "Invalid email format."});

        const existingEmail = await students.findOne({email});
        if(existingEmail) return res.status(400).json({error: "Email already exists."});

        const existingUser = await students.findOne({
            first_name: {$regex: `^${first_name}$`, $options: "i"},
            last_name: {$regex: `^${last_name}$`, $options: "i"}
        });

        if(existingUser) return res.status(400).json({error: "User already exists."});
        const hashedPassword = await bcrypt.hash(password, 10);

        await students.insertOne({first_name, last_name, age, gender, phone, password: hashedPassword, email});

        return res.status(200).json({message: "User created successfully."});
    } 
    catch(err){
        console.error("Error in signup:", err);
        return res.status(500).json({error: "Internal Server Error"});
    }
}

async function getAllStudents(req, res){
    try{
        const students = await getStudentCollection();
        const data = await students.find({}).toArray();
        res.json(data);
    } 
    catch(err){
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function getStudentById(req, res){
    try{
        const students = await getStudentCollection();
        const {id} = req.params;
        if(!ObjectId.isValid(id)) return res.status(400).json({error: "Invalid ID."});

        const student = await students.findOne({_id: new ObjectId(id)});
        if(!student) return res.status(404).json({error: "Student not found."});

        res.json(student);
    } 
    catch(err){
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function updateStudent(req, res){
    try{
        const students = await getStudentCollection();
        const {id} = req.params;
        const {first_name, last_name, gender, age, email, phone, password} = req.body;

        if(!ObjectId.isValid(id)) return res.status(400).json({error: "Invalid ID."});

        const updates = {};

        if(!first_name && !last_name && !gender && !age && !email && !phone && !password){
            return res.status(400).json({error: "At least one field must be provided to update."});
        }

        if(first_name){
            const nameRegex = /^[a-zA-Z'-]{2,50}$/;
            if(!nameRegex.test(first_name)) return res.status(400).json({error: "Invalid first name format."});
            updates.first_name = first_name;
        }

        if(last_name){
            const nameRegex = /^[a-zA-Z'-]{2,50}$/;
            if(!nameRegex.test(last_name)) return res.status(400).json({error: "Invalid last name format."});
            updates.last_name = last_name;
        }

        if(gender){
            const validGenders = ["M", "F", "Others"];
            if (!validGenders.includes(gender)){
                return res.status(400).json({error: "Gender must be 'M', 'F', or 'Others'."});
            }
            updates.gender = gender;
        }

        if(age){
            if(age<=1 || age>=100) return res.status(400).json({ error: "Age must be between 2 and 99." });
            updates.age = age;
        }

        if(email){
            const emailRegex = /^[A-Za-z0-9._%+-]{2,}@[A-Za-z0-9.-]{2,}\.[A-Za-z]{2,}$/;
            if(!emailRegex.test(email)) return res.status(400).json({error: "Invalid email format."});
            const existingEmail = await students.findOne({email});
            if(existingEmail) return res.status(400).json({error: "Email already exists."});    
            updates.email = email;
        }

        if(phone){
            const phoneRegex = /^(?:\+91|91)?[789]\d{9}$/;
            if(!phoneRegex.test(phone)) return res.status(400).json({error: "Invalid phone number format."});
            updates.phone = phone;
        }

        if(password){
            const passwordRegex = /^.{8,}$/;
            if(!passwordRegex.test(password)) return res.status(400).json({error: "Password must be at least 8 characters"});
            updates.password = await bcrypt.hash(password, 10);
        }

        if(first_name || last_name){
            const existingUser = await students.findOne({
                first_name: {$regex: `^${first_name}$`, $options: "i"},
                last_name: {$regex: `^${last_name}$`, $options: "i"},
                _id: {$ne: new ObjectId(id)} 
            });

            if(existingUser) return res.status(400).json({error: "Another user with the same name already exists."});
        }

        const result = await students.updateOne({_id: new ObjectId(id) }, {$set: updates});
        if(result.matchedCount === 0) return res.status(404).json({error: "Student not found."});

        res.json({message: "Student updated successfully."});
    } 
    catch(err){
        res.status(500).json({error: "Internal Server Error"});
    }
}

async function deleteStudent(req, res){
    try{
        const students = await getStudentCollection();
        const {id} = req.params;
        if(!ObjectId.isValid(id)) return res.status(400).json({error: "Invalid ID."});

        const result = await students.deleteOne({_id: new ObjectId(id)});
        if(result.deletedCount === 0) return res.status(404).json({error: "Student not found."});

        res.json({message: "Student deleted successfully."});
    } 
    catch(err){
        res.status(500).json({error: "Internal Server Error"});
    }
}

module.exports = {signup, getAllStudents, getStudentById, updateStudent, deleteStudent};
