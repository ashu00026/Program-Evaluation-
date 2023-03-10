const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
// const autoIncrement = require('mongoose-auto-increment');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: Number,
    required: [true, "Id must be provided"],
    trim: true,
    unique: true,
  },
  name: {
    type: String,
    required: [true, "name must be provided"],
    trim: true,
    maxlength: [20, "name cannot be more than 20 characters"],
  },
  semester: {
    type: Number,
    required: [true, "year must be provided"],
  },
  section: {
    type: String,
    required: [true, "section must be provided"],
  },
  email: {
    type: String,
    required: [true, "students email is required"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  mobileNumber: {
    type: Number,
    unique: true,
  },
  department: {
    type: String,
    required: [true, "please provide department of the student"],
  },
  //department
});

const resultsSchema = new mongoose.Schema({
  studentid: {
    type: Number,
    required: [true, "Mention Student ID"],
  },
  studentName: {
    type: String,
    required: [true, "mention name"],
  },
  subjectName: {
    type: String,
    required: [true, "Provide Subject name!"],
  },
  semester: {
    type: Number,
    required: [true, "provide semester"],
  },
  section: {
    type: String,
    required: [true, "provide section"],
  },
  results: [
    {
      type: Number,
      default: 0,
    },
  ],
  department: {
    type: String,
    required: [true, "department should be mentioned"],
  },
});

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "provide name"],
    trim: true,
    maxlength: [20, "name cannot be more than 20 characters"],
  },
  email: {
    type: String,
    required: [true, "staffs email is required"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  mobileNumber: {
    type: Number,
    unique: true,
  },
  id: {
    type: String,
    required: [true, "please assign a faculty ID"],
    unique: true,
  },
  department: {
    type: String,
    reqired: [true, "please provide the depatment details"],
  },
  // department:{
  //     type:String,
  //     required:[true,'staff department is required']
  // }
});
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "provide name"],
    trim: true,
    maxlength: [20, "name cannot be more than 20 characters"],
  },
  email: {
    type: String,
    required: [true, "staffs email is required"],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
  },
  mobileNumber: {
    type: Number,
    unique: true,
  },
  id: {
    type: String,
    required: [true, "please assign a faculty ID"],
    unique: true,
  },
  department: {
    type: String,
    reqired: [true, "please provide the depatment details"],
  },
  // department:{
  //     type:String,
  //     required:[true,'staff department is required']
  // }
});

const subjectsSchema = new mongoose.Schema({
  name: {
    type: String,
    // required:[true,'Provide name'],
    trim: true,
    maxlength: [20, "Name cannot be more than 20 characters"],
  },
  details: {
    semester: {
      type: Number,
      required: [true, "Methion the semeter"],
    },
    section: {
      type: String,
      required: [true, "provide section"],
    },
    subjects: [
      {
        type: String,
      },
    ],
  },
  department: {
    type: String,
    required: [true, "mention departments"],
  },
});

const questionsSchema = new mongoose.Schema({
  sampleInput:{

  },
  sampleOutput:{

  },
  problemName: {
    type: String,
    required: [true, "please provide a short name for the problem"],
  },
  questionNumber: {
    type: Number,
    required: [true, "please provide a question number"],
  },
  problemStatement: {
    type: String,
    required: [true, "please provide a question"],
  },
  testCases: [
    {
      input: {},
      output: {},
    },
  ],
  testCasesCount: {
    type: Number,
    default: 0,
  },
  subject: {
    type: String,
    required: [true, "mention the subject"],
  },
  semester: {
    type: Number,
    required: [true, "mention the Semester details"],
  },
  department: {
    type: String,
    required: [true, "give the department Details"],
  },
});

const passwordsSchema = new mongoose.Schema({
  adminPass: {
    type: String,
    required: [true, "give a admin password"],
  },
  studentPass: {
    type: String,
    required: [true, "give Student Password"],
  },
  staffPass: {
    type: String,
    required: [true, "give staff Password"],
  },
  jwtSecret: {
    type: String,
    required: [true, "jwt password must be provided for security"],
  },
});

passwordsSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.adminPass = await bcrypt.hash(this.adminPass, salt);
  this.studentPass = await bcrypt.hash(this.studentPass, salt);
  this.staffPass = await bcrypt.hash(this.staffPass, salt);
  this.jwtSecret = await bcrypt.hash(this.jwtSecret, salt);
});

const passwordsDatabase = mongoose.model("keysDb", passwordsSchema);
const questionsDatabase = mongoose.model("questionsDatabase", questionsSchema);
const studentDatabase = mongoose.model("studentdb", studentSchema);
const staffDatabase = mongoose.model("staffdb", staffSchema);
const resultsDatabase = mongoose.model("resultsdb", resultsSchema);
const subjectsDatabase = mongoose.model("subjectsdb", subjectsSchema);
const adminsDatabase=mongoose.model("admindbs",adminSchema)

module.exports = {
  studentDatabase,
  staffDatabase,
  resultsDatabase,
  subjectsDatabase,
  questionsDatabase,
  passwordsDatabase,
  adminsDatabase
};
