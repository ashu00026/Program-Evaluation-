const mongoose=require('mongoose')
// const autoIncrement = require('mongoose-auto-increment');

const studentSchema= new mongoose.Schema({
    studentId:{
        type:Number,
        required:[true,'Id must be provided'],
        trim:true,
    },
    name:{
        type:String,
        required:[true,'name must be provided'],
        trim:true,
        maxlength:[20,'name cannot be more than 20 characters']
    },
    semester:{
        type:Number,
        required:[true,'year must be provided'],
    },
    section:{
        type:String,
        required:[true,'section must be provided']
    }
    //department
})

const resultsSchema=new mongoose.Schema({
    studentid:{
        type:Number,
        required:[true,'Mention Student ID']
    },
    studentName:{
        type:String,
        required:[true,'mention name']
    },
    subjectName:{
        type:String,
        required:[true,'Provide Subject name!']
    },
    semester:{
        type:Number,
        required:[true,'provide semester']
    },
    section:{
        type:String,
        required:[true,'provide section']
    },
    results:[{
        type:Number,
        default:0
    }],
    // department:{
    //     type:String,
    //     required:[true,'department should be mentioned']
    // },
})


const staffSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'provide name'],
        trim:true,
        maxlength:[20,'name cannot be more than 20 characters']
    },
    id:{
        type:String,
        required:[true,'please assign a faculty ID'],
        unique:[true,'staff with the id is already present'],
    },
    // department:{
    //     type:String,
    //     required:[true,'staff department is required']
    // }
})

const subjectsSchema=new mongoose.Schema({
    name:{
        type:String,
        // required:[true,'Provide name'],
        trim:true,
        maxlength:[20,'Name cannot be more than 20 characters']
    },
    details:{
        semester:{
            type:Number,
            required:[true,'Methion the semeter']
        },
        section:{
            type:String,
            required:[true,'provide section']
        },
        subjects:[{
        type:String,}],
        // deparment:{
        //     type:String,
        //     required:[true,'mention departments']
        // }
},
})

const questionsSchema=new mongoose.Schema({
    problemName:{
        type:String,
        required:[true,"please provide a short name for the problem"]
    },
    problemStatement:{
        type:String,
        required:[true,"please provide a question"]
    },
    testCases:[{
        input:{

        },
        output:{

        }
    }],
    testCasesCount:{
        type:Number,
        default:0
    },
    subject:{
        type:String,
        required:[true,"mention the subject"]
    },
    semester:{
        type:Number,
        required:[true,"mention the Semester details"]
    },
    department:{
        type:String,
        required:[true,"give the department Details"]
    }
})

const questionsDatabase=mongoose.model('questionsDatabase',questionsSchema)
const studentDatabase =mongoose.model('studentdb', studentSchema)
const staffDatabase=mongoose.model('staffdb',staffSchema)
const resultsDatabase=mongoose.model('resultsdb',resultsSchema)
const subjectsDatabase=mongoose.model('subjectsdb',subjectsSchema)

module.exports={
    studentDatabase,
    staffDatabase,
    resultsDatabase,
    subjectsDatabase,
    questionsDatabase
}