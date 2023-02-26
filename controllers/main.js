require('dotenv').config();
const bcrypt = require('bcryptjs');
const { UnauthenticatedError } = require('../errors')

const {studentDatabase,
  staffDatabase,
  resultsDatabase,
  subjectsDatabase,questionsDatabase,passwordsDatabase}=require('../model/schema')

const jwt = require('jsonwebtoken')
const { BadRequestError } = require('../errors');
const e = require('express');

// const deleteSubject=async(req,res)=>{
//   const {subName,semester} = req.body
//   console.log(req.body)


const addpasswords=async(req,res)=>{
  console.log("passwords")
  const{adminPass,staffPass,studentPass,jwtSecret}=req.body
  console.log(req.body)
  try{
    await passwordsDatabase.create({adminPass,staffPass,studentPass,jwtSecret})

  }catch(e){
    console.log(e)
  }
  console.log("done!")
  res.json({msg:"created the passwords"})
}


// }

const register= async(req,res)=>{
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({msg:"unauthenticated User"})
  }else{
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET,async function (err, decoded){
      console.log("22222");
      if (err){
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
      } else {
        const { username} = decoded
        theUser=username
        if(theUser=="staff" || theUser=="admin"){//roles
	


	//code goes here
  const { username, password , name , theSemester,studentId,staffId,section,email,mobileNumber,department} = req.body
  const passwordsRecord=await passwordsDatabase.findOne({_id:"63d8ff2a763e582eb05f6bd8"})
  console.log(req.body)
  console.log(username,password)
  console.log(staffId)
  console.log(section)
  if (!username || !password) {
    throw new BadRequestError('Please provide email and password')
  }else{
  if(username=='admin'){
    console.log( "inside right direction")
    console.log(password)
    // console.log(process.env.Admin_pass)


    const adminPass=await passwordsRecord.adminPass
    const isMatch= await bcrypt.compare(password,adminPass)
    console.log(isMatch)

    if(isMatch){
      // const id = new Date().getDate()
      console.log(`insisde the admin if block!`)
      // const adminToken = jwt.sign({ password,username }, process.env.JWT_SECRET, {
      //   expiresIn: '30d',
      // })
      // console.log(adminToken)
      res.status(200).json({ msg: 'admin created' 
      // "adminToken":adminToken
     })
    }
  }
  else if(username=='student'){
    console.log( "inside student right direction")
    console.log(password)
    console.log(name)
    console.log(theSemester)
    console.log(studentId)

    // await subjectsDatabase.create({name:'madam1',details:{semester:8,subjects:["dbms"]}})///remove when staff & subjects both are added
      console.log(passwordsRecord)
      const studentPass=passwordsRecord.studentPass;
      console.log("student password:",studentPass)
      console.log("password given",password)
    const isMatch= await bcrypt.compare(password,studentPass)
    console.log("compared",isMatch)
    if(isMatch){
      const duplicate= await studentDatabase.findOne({name:name,studentId})
      console.log(name)
      console.log(duplicate)
      
        try{
          if(duplicate==null){
            console.log('insside the duplicates')
            const arr = new Array(10).fill(0);
           // const arr[]={0}
           const theDepartmentOfStudent=await department.toUpperCase()
        await studentDatabase.create({studentId:studentId,name:name,semester:theSemester,section:section,email,mobileNumber,department:theDepartmentOfStudent})
        // const test=await subjectsDatabase.find()
        // console.log("testing",test)
        const subjectRecords=await subjectsDatabase.find({'details.semester':Number(theSemester),'details.section':section})
        console.log(subjectRecords)
        subjectRecords.forEach(subjectRecord => {
          const subjectsArr=subjectRecord.details.subjects
          subjectsArr.forEach(subjectName=>{
            resultsDatabase.create({studentid:studentId,studentName:name,semester:theSemester,section:section,department:theDepartmentOfStudent,subjectName:subjectName,results:arr})
          })
        });
        // const studentToken = jwt.sign({username,password}, process.env.JWT_SECRET, {
        //   expiresIn: '30d',
        // })
        // console.log(studentToken)
        res.status(200).json({ msg: 'student created',"name of the student: ":name,"semester":theSemester,section:section,id:studentId,
        // "token":studentToken,
        email,mobileNumber })
        
      }else{
        res.json({"msg":"please provide unique id"})
      }   }catch(e){
        res.json({msg:e.message})

      }
}else{
  res.json({msg:"wrong credentials"})
}
} else if(username=='staff'){
  console.log( "inside right direction")
  console.log("name: ",name)
  // console.log("subjects :",subjects)
  console.log(password)
  // console.log(process.env.Staff_pass)
  const theDepartmentOfUser=await department.toUpperCase()

  const staffPass=passwordsRecord.staffPass
  const isMatch=await bcrypt.compare(password,staffPass)
  console.log(isMatch)
  if(isMatch){
    // if(!staffs.includes(name)){
    //   staffDatabase.create({name:name,subjects:subjects})
    //   staffs.push(name)}
    const duplicateStaff=await staffDatabase.findOne({name:name,id:staffId})
    console.log(duplicateStaff)
    try{
        if(duplicateStaff==null){
          await staffDatabase.create({name:name,id:staffId,email,mobileNumber,department:theDepartmentOfUser})//try catch
          // const id = new Date().getDate()
          console.log(`insisde the staff if block!`)
        //   const staffToken = jwt.sign({password,username}, process.env.JWT_SECRET, {
        //   expiresIn: '30d',
        // })
          // console.log(staffToken)
          res.status(200).json({ msg: 'staff created', "Name of Staff: ":name ,
          // "token":staffToken,
          email,mobileNumber,department })
        }else{
          res.status(200).json({msg:`staff with name ${name} and id ${staffId} already exists`})
        }
        
      }catch(err){
        console.log(err.message)
        res.status(200).json({'msg':err.message})
      }
  }
}
}



	}else{
        res.status(401).json({msg:"you are not authorized for this route"})
        }
	}



	});


  // const students=[]
  // const staffs=[]
//   const { username, password , name , theSemester,studentId,staffId,section,email,mobileNumber,department} = req.body
//   const passwordsRecord=await passwordsDatabase.findOne({_id:"63d8ff2a763e582eb05f6bd8"})
//   console.log(req.body)
//   console.log(username,password)
//   console.log(staffId)
//   console.log(section)
//   if (!username || !password) {
//     throw new BadRequestError('Please provide email and password')
//   }else{
//   if(username=='admin'){
//     console.log( "inside right direction")
//     console.log(password)
//     // console.log(process.env.Admin_pass)


//     const adminPass=await passwordsRecord.adminPass
//     const isMatch= await bcrypt.compare(password,adminPass)
//     console.log(isMatch)

//     if(isMatch){
//       // const id = new Date().getDate()
//       console.log(`insisde the admin if block!`)
//       // const adminToken = jwt.sign({ password,username }, process.env.JWT_SECRET, {
//       //   expiresIn: '30d',
//       // })
//       // console.log(adminToken)
//       res.status(200).json({ msg: 'admin created' 
//       // "adminToken":adminToken
//      })
//     }
//   }
//   else if(username=='student'){
//     console.log( "inside student right direction")
//     console.log(password)
//     console.log(name)
//     console.log(theSemester)
//     console.log(studentId)

//     // await subjectsDatabase.create({name:'madam1',details:{semester:8,subjects:["dbms"]}})///remove when staff & subjects both are added
//       console.log(passwordsRecord)
//       const studentPass=passwordsRecord.studentPass;
//       console.log("student password:",studentPass)
//       console.log("password given",password)
//     const isMatch= await bcrypt.compare(password,studentPass)
//     console.log("compared",isMatch)
//     if(isMatch){
//       const duplicate= await studentDatabase.findOne({name:name,studentId})
//       console.log(name)
//       console.log(duplicate)
      
//         try{
//           if(duplicate==null){
//             console.log('insside the duplicates')
//             const arr = new Array(10).fill(0);
//            // const arr[]={0}
//         await studentDatabase.create({studentId:studentId,name:name,semester:theSemester,section:section,email,mobileNumber})
//         // const test=await subjectsDatabase.find()
//         // console.log("testing",test)
//         const subjectRecords=await subjectsDatabase.find({'details.semester':Number(theSemester),'details.section':section})
//         console.log(subjectRecords)
//         subjectRecords.forEach(subjectRecord => {
//           const subjectsArr=subjectRecord.details.subjects
//           subjectsArr.forEach(subjectName=>{
//             resultsDatabase.create({studentid:studentId,studentName:name,semester:theSemester,section:section,subjectName:subjectName,results:arr})
//           })
//         });
//         // const studentToken = jwt.sign({username,password}, process.env.JWT_SECRET, {
//         //   expiresIn: '30d',
//         // })
//         // console.log(studentToken)
//         res.status(200).json({ msg: 'student created',"name of the student: ":name,"semester":theSemester,section:section,
//         // "token":studentToken,
//         email,mobileNumber })
        
//       }else{
//         res.json({"msg":"please provide unique id"})
//       }   }catch(e){
//         res.json({msg:e.message})

//       }
// }else{
//   res.json({msg:"wrong credentials"})
// }
// } else if(username=='staff'){
//   console.log( "inside right direction")
//   console.log("name: ",name)
//   // console.log("subjects :",subjects)
//   console.log(password)
//   // console.log(process.env.Staff_pass)

//   const staffPass=passwordsRecord.staffPass
//   const isMatch=await bcrypt.compare(password,staffPass)
//   console.log(isMatch)
//   if(isMatch){
//     // if(!staffs.includes(name)){
//     //   staffDatabase.create({name:name,subjects:subjects})
//     //   staffs.push(name)}
//     const duplicateStaff=await staffDatabase.findOne({name:name,id:staffId})
//     console.log(duplicateStaff)
//     try{
//         if(duplicateStaff==null){
//           await staffDatabase.create({name:name,id:staffId,email,mobileNumber})//try catch
//           // const id = new Date().getDate()
//           console.log(`insisde the staff if block!`)
//         //   const staffToken = jwt.sign({password,username}, process.env.JWT_SECRET, {
//         //   expiresIn: '30d',
//         // })
//           // console.log(staffToken)
//           res.status(200).json({ msg: 'staff created', "Name of Staff: ":name ,
//           // "token":staffToken,
//           email,mobileNumber,department })
//         }else{
//           res.status(200).json({msg:`staff with name ${name} and id ${staffId} already exists`})
//         }
        
//       }catch(err){
//         console.log(err.message)
//         res.status(200).json({'msg':err.message})
//       }
//   }
// }
}
}

const login = async (req, res) => {
  // const requestedName=req.body.name
  const { username ,theName ,staffSubjects,theId,subjects,section,semester,token,thePassword,password} = req.user
  const passwordsRecord=await passwordsDatabase.findOne({_id:"63d8ff2a763e582eb05f6bd8"})
  console.log(req.user)
  console.log(username ,theName , section,semester)
  // const {password}=req.body
  // mongoose validation
  // Joi
  // check in the controller
  if(username=='admin'){
    console.log( "inside right direction")
    console.log(password)
    // console.log(process.env.Admin_pass)
    const adminPass=passwordsRecord.adminPass
    const isMatch=await bcrypt.compare(password,adminPass)
    console.log(isMatch)
    if(password==process.env.Admin_pass){
      console.log(`insisde the admin if block!`)
      res.status(200).json({})
    }else{
      res.status(401).json({msg:"wrong credentials"})
    }
  }
  else if(username=='student'){
    console.log("student")
    console.log(theName)
    console.log(semester)
    console.log(section)
    console.log(theId)
    console.log(subjects)
    console.log(password)
    // console.log(password)
    // const password='student'///make it manual------------------------------------
    // console.log(process.env.Student_pass)
    console.log("unnchanged")
    const studentPass=passwordsRecord.studentPass
    const isMatch=await bcrypt.compare(thePassword,studentPass)
    console.log(isMatch)
    if(isMatch){
      console.log("innn")
    res.status(200).json({username,theName,section,semester,token,subjects,theId})
    }else{
      res.status(401).json({msg:"wrong credentials"})
    }
  }
  else if(username=='staff'){
    console.log("staff")
    console.log(theName,staffSubjects)
    console.log(theId)
    console.log(username)
    console.log(thePassword,"thepassword")
    // console.log(process.env.Staff_pass)
    const staffPass=passwordsRecord.staffPass
    const isMatch=await bcrypt.compare(thePassword,staffPass)
    console.log(isMatch)
    if(isMatch){
      console.log("innnn")
      res.status(200).json({theName,staffSubjects,theId,username,token})
  }else{
    res.status(401).json({msg:"wrong credentials"})
  }
  }

}

const addSubject=async(req,res)=>{
  console.log("++++")

  const authHeader = req.headers.authorization
  console.log("+++++++")
  console.log(!authHeader)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({msg:"unauthenticated user"})
  }else{
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET,async function (err, decoded){
	console.log("22222");
      if (err){
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
      } else {
        const { username} = decoded
        if(username=="staff" || username=="admin"){//roles
	


	//code goes here
  console.log("inside add subject")
  const {name,semester,subject,section,department}=req.body
  const theDepartmentOfStudent=await department.toUpperCase()
  try{
    const allSubjectsOfSemester=[]
    const nonDuplicateSubjectRecord=await subjectsDatabase.find({'details.semester':semester,'details.section':section,department:theDepartmentOfStudent})
    nonDuplicateSubjectRecord.forEach(record=>{
      const beforeSubjects=record.details.subjects
      beforeSubjects.forEach(subject=>{
        allSubjectsOfSemester.push(subject)
      })
    })
    if(allSubjectsOfSemester.includes(subject)){
        res.status(200).json({msg:`the subject is already assigned for the section`})
    }else{
        // await subjectsDatabase.create({name:name,details:{semester:semester,subjects:arrSubjects}})
        const duplicateEntry=await subjectsDatabase.findOne({name:name,'details.semester':semester,'details.section':section,department:theDepartmentOfStudent})
        console.log(duplicateEntry)
        // console.log(duplicateEntry.details.subjects)
        if(duplicateEntry == null ){
          console.log('duplicate ==null')
          const arrSubjects=[]
          arrSubjects.push(subject)
          console.log(arrSubjects)
          await subjectsDatabase.create({name:name,department:theDepartmentOfStudent,details:{semester:semester,section:section,subjects:arrSubjects}})
          const theStudentsAlreadyPresent=await studentDatabase.find({semester,department:theDepartmentOfStudent,section})
          theStudentsAlreadyPresent.forEach(async student=>{
            const arr = new Array(10).fill(0);
            const studentId=await student.studentId
            const theStudentName=await student.name
            const theSemester=await student.semester
            const TheSection=await student.section
            const theDepartmentofHim=await student.department
            const subjectName=subject
            await resultsDatabase.create({studentid:studentId,studentName:theStudentName,semester:theSemester,section:TheSection,department:theDepartmentofHim,subjectName:subjectName,results:arr})
          })
          res.status(200).json({msg:`subject added to the faculty`,presentSubjects:arrSubjects})
        }else{
          const presentSubjects=duplicateEntry.details.subjects
          if(!presentSubjects.includes(subject)){
            //update the subjects array in the db
            await presentSubjects.push(subject)
            console.log(presentSubjects);
            await subjectsDatabase.findOneAndUpdate({name:name,department:theDepartmentOfStudent,'details.semester':semester,'details.section':section},{'details.subjects':presentSubjects},{new:true,runValidators: true})
            const theStudentsAlreadyPresent=await studentDatabase.find({semester,department:theDepartmentOfStudent,section})
            theStudentsAlreadyPresent.forEach(async student=>{
              const arr = new Array(10).fill(0);
              const studentId=await student.studentId
              const theStudentName=await student.name
              const theSemester=await student.semester
              const TheSection=await student.section
              const theDepartmentofHim=await student.department
              const subjectName=subject
              await resultsDatabase.create({studentid:studentId,studentName:theStudentName,semester:theSemester,section:TheSection,department:theDepartmentofHim,subjectName:subjectName,results:arr})



            })
            res.status(200).json({msg:`updated the subject of the staff ${name}`,subjects:presentSubjects})
          }else{
            res.status(200).json({msg:`the subject is already present for the staff ${name}`, presentsubjects:presentSubjects})
            }
            }
      }
}catch(err){
    console.log(err.message)
  }  



	      }else{
        res.status(401).json({msg:"you are not authorized for this route"})
        }
	}
	});
//   console.log("inside add subject")
//   const {name,semester,subject,section}=req.body
//   try{
//     const allSubjectsOfSemester=[]
//     const nonDuplicateSubjectRecord=await subjectsDatabase.find({'details.semester':semester,'details.section':section})
//     nonDuplicateSubjectRecord.forEach(record=>{
//       const beforeSubjects=record.details.subjects
//       beforeSubjects.forEach(subject=>{
//         allSubjectsOfSemester.push(subject)
//       })
//     })
//     if(allSubjectsOfSemester.includes(subject)){
//         res.status(200).json({msg:`the subject is already assigned for the section`})
//     }else{
//         // await subjectsDatabase.create({name:name,details:{semester:semester,subjects:arrSubjects}})
//         const duplicateEntry=await subjectsDatabase.findOne({name:name,'details.semester':semester,'details.section':section})
//         console.log(duplicateEntry)
//         // console.log(duplicateEntry.details.subjects)
//         if(duplicateEntry == null ){
//           console.log('duplicate ==null')
//           const arrSubjects=[]
//           arrSubjects.push(subject)
//           console.log(arrSubjects)
//           await subjectsDatabase.create({name:name,details:{semester:semester,section:section,subjects:arrSubjects}})
//           res.status(200).json({msg:`subject added to the faculty`,presentSubjects:arrSubjects})
//         }else{
//           const presentSubjects=duplicateEntry.details.subjects
//           if(!presentSubjects.includes(subject)){
//             //update the subjects array in the db
//             await presentSubjects.push(subject)
//             console.log(presentSubjects);
//             await subjectsDatabase.findOneAndUpdate({name:name,'details.semester':semester,'details.section':section},{'details.subjects':presentSubjects},{new:true,runValidators: true})
//             res.status(200).json({msg:`updated the subject of the staff ${name}`,subjects:presentSubjects})
//           }else{
//             res.status(200).json({msg:`the subject is already present for the staff ${name}`, presentsubjects:presentSubjects})
//             }
//             }
//       }
// }catch(err){
//     console.log(err.message)
  }  
}

const getStudent=async(req,res)=>{
  const studentID=req.query.studentId
  console.log(studentID)
  const theStudent=await studentDatabase.find({studentId:studentID})
  console.log(theStudent)
  res.status(200).json({theStudent})
}

const getFaculty=async(req,res)=>{
  const authHeader = req.headers.authorization
  const token = authHeader.split(' ')[1]
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provided')
  }else{
    const decoded = jwt.verify(token, process.env.JWT_SECRET,async function (err, decoded){
      console.log("22222");
      if (err){
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
      } else {
        const { username} = decoded
        if(username=="staff" || username=="admin"){//roles assigned
          const staffID=req.query.staffId
          console.log(staffID)
          const theStaff=await staffDatabase.findOne({id:staffID})
          const staffName=theStaff.name
          console.log(staffName)
          const subjects=await subjectsDatabase.find({name:staffName})
          console.log(theStaff)
          console.log(subjects)
          res.status(200).json({staff:theStaff,subjects:subjects})
        }else{
          res.status(401).json({msg:"you are not authorized for this route"})
        }
      }
    });
  }


  // const staffID=req.query.staffId
  // console.log(staffID)
  // const theStaff=await staffDatabase.findOne({id:staffID})
  // const staffName=theStaff.name
  // console.log(staffName)
  // const subjects=await subjectsDatabase.find({name:staffName})
  // console.log(theStaff)
  // console.log(subjects)
  // res.status(200).json({staff:theStaff,subjects:subjects})
}

const getAllResults=async(req,res)=>{
  const authHeader = req.headers.authorization
  const token = authHeader.split(' ')[1]
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('No token provided')
  }else{
    const decoded = jwt.verify(token, process.env.JWT_SECRET,async function (err, decoded){
      console.log("22222");
      if (err){
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
      } else {
        const { username} = decoded
        if(username=="staff" || username=="admin"){
          console.log("getAllResults")
          const theSubject=req.query.subject
          const theSemester=req.query.semester
          const theDepartment=req.query.department
          const section=req.query.section
          const results=await resultsDatabase.find({subjectName:theSubject,semester:theSemester,section:section})
          console.log(results)
          if(!(results==null)){
          const theResult=[]
          console.log(results)
          results.forEach(record=>{
          const name=record.studentName
           const ID=record.studentid
          const results=record.results
          theResult.push({name,ID,results})
          })
        res.status(200).json({Result:theResult})
      }else{
        res.json({msg:'Data not found'})
      }
      }else{
        res.status(401).json({msg:"you are not authorized for this route"})
        }}

    });
     
  



  // console.log("getAllResults")
  // const theSubject=req.query.subject
  // const theSemester=req.query.semester
  // const theDepartment=req.query.department
  // const section=req.query.section
  // const results=await resultsDatabase.find({subjectName:theSubject,semester:theSemester,section:section})
  // console.log(results)
  // if(!(results==null)){
  //   const theResult=[]
  //   console.log(results)
  // results.forEach(record=>{
  //   const name=record.studentName
  //   const ID=record.studentid
  //   const results=record.results
  //   theResult.push({name,ID,results})
  // })
  // res.status(200).json({Result:theResult})
  // }else{
  //   res.json({msg:'Data not found'})
  }
}
const getResult=async(req,res)=>{
  console.log("getResult")
  const ID=req.query.studentId
  const theSubject=req.query.subject
  console.log(ID,theSubject)
  const studentRecord=await studentDatabase.findOne({studentId:ID})
  const theStudentName=studentRecord.name
  console.log(theStudentName)
  console.log(theSubject)
  console.log(ID)
  const result=await resultsDatabase.findOne({studentid:ID,subjectName:theSubject})
  console.log(result)
  const theResult=result.results
  res.status(200).json({studentId:ID,name:theStudentName,subject:theSubject,Result:theResult})
}

const addProblem=async(req,res)=>{
  console.log("+++++")

  const authHeader = req.headers.authorization
  console.log("++++")
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // throw new UnauthenticatedError('No token provided')
    res.json({msg:"unauthenticated user"})
  }else{
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET,async function (err, decoded){
	console.log("22222");
      if (err){
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
      } else {
        const { username} = decoded
        if(username=="staff"){//roles
          console.log("inside add prblem")
          const {problemStatement,testCases,subject,semester,department,problemName,questionNumber}=req.body
          const theproblemName=await problemName.toUpperCase();
          const theSubject=await subject.toUpperCase();
          const theDepartment=await department.toUpperCase();
          var testCaseCount=testCases.length
          await questionsDatabase.create({problemStatement:problemStatement,problemName:theproblemName,
    testCases:testCases,subject:theSubject,testCasesCount:testCaseCount,semester:semester,department:theDepartment,questionNumber
  })
  res.status(200).json({msg:"problem added to subject!"})
	


	//code goes here



	}else{
        res.status(401).json({msg:"you are not authorized for this route"})
        }
	}



	});









  // console.log("inside add prblem")
  // const {problemStatement,testCases,subject,semester,department,problemName}=req.body
  // const theproblemName=problemName.toUpperCase();
  // const theSubject=subject.toUpperCase();
  // const theDepartment=department.toUpperCase();
  // var testCaseCount=testCases.length
  // await questionsDatabase.create({problemStatement:problemStatement,problemName:theproblemName,
  //   testCases:testCases,subject:theSubject,testCasesCount:testCaseCount,semester:semester,department:theDepartment
  // })
  // res.status(200).json({msg:"problem added to subject!"})
}
}

const getQuestions=async(req,res)=>{
  console.log("inside getQuestions")
  const {subject,semester,department}=req.body
  console.log(subject,semester,department)
  const theDepartment=await department.toUpperCase();
  const theSubject=await subject.toUpperCase();
  const questions=await questionsDatabase.find({subject:theSubject,semester:semester,department:theDepartment})
  console.log(questions)
  if(questions.length==0){
    res.json({msg:"no questions found for the subject"})
  }else{
    const questionsArray=[]
    questions.forEach(record=>{
      const theQuestion=record.problemName
      questionsArray.push(theQuestion)
    })
    res.status(200).json({msg:"The subject Problems",problems:questionsArray})
  }
}
// const facultyDashBoard=async(req,res)=>{
const getQuestion=async(req,res)=>{
  console.log("inside the getQuestion")
const {semester,problemName,department,subject}=req.query;
console.log(semester,problemName,department,subject)
const theDepartment=await department.toUpperCase();
const theProblemName=await problemName.toUpperCase();
const theSubject=await subject.toUpperCase();
const theProblem=await questionsDatabase.findOne({semester:semester,department:theDepartment,
  subject:theSubject,problemName:theProblemName})
  console.log("ended")
  if(theProblem==null){
    res.json({msg:"this question doesnt exists"})
  }else{
    const theQuestionNumber=theProblem.questionNumber
    const theTestCases=theProblem.testCases
    const theProblemStatement=theProblem.problemStatement
    res.json({testCases:theTestCases,questionNumber:theQuestionNumber,problemStatement:theProblemStatement})
  }

}

// }

module.exports = {
  login,
  register,
  addSubject,
  getStudent,
  getFaculty,
  getAllResults,
  getResult,
  addProblem,
  getQuestions,
  getQuestion,
  addpasswords
  // deleteSubject
}
