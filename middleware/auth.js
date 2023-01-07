const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')
const { staffDatabase, subjectsDatabase, studentDatabase } = require('../model/schema')
const { BadRequestError } = require('../errors');


const authenticationMiddleware = async (req, res, next) => {
  console.log("auth!!!!")
  console.log(req.body)


  if(!req.body.isRegistered){
    console.log("register request!")
    next()
  }else{
    const authHeader = req.headers.authorization
    const {theUser,thePassword,theId,theName}=req.body
    if (!theUser || !thePassword) {
      throw new BadRequestError('Please provide email and password')
    }else{
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthenticatedError('No token provided')
      }
    
      const token = authHeader.split(' ')[1]
      console.log(token)
    
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET,async function (err, decoded){
          console.log("22222");
          if (err){
              console.log(err);
              req.authenticated = false;
              req.decoded = null;
          } else {
              console.log("33333");
              // req.decoded = decoded;
              // req.authenticated = true;
              console.log(decoded)
              const { username,password} = decoded
              // const password='student'
              if(username=='staff'){
                console.log(password)
                console.log(thePassword)
                if(password==thePassword){
                  const theStaff= await staffDatabase.findOne({name:theName,id:theId})
                if(theStaff==null){
                res.json({msg:'wrong credentials'})
              }
              else{
                const staffSubjects=[]
                const subjectsRecord=await subjectsDatabase.find({name:theName})
                subjectsRecord.forEach(record => {
                  const subjects=record.details.subjects
                  subjects.forEach(subject=>{
                    staffSubjects.push(subject)
                  })
                });
                
              req.user = { theId,theName,staffSubjects,token,username,thePassword,password }
              next()
              }

              }else{
                res.json({msg:'Wrong Password'})
              }
              }
              else if(username=='student'){
                if(password==thePassword){
                  console.log(theName)
                  console.log(theId)
                  const theStudent= await studentDatabase.findOne({name:theName,studentId:Number(theId)})
                  console.log("the STudent",theStudent)

                  if(theStudent==null){
                    res.json({msg:'wrong credentials'})
                  }else{
                    const subjects=[]
                  console.log(theStudent)
                  const particularSemister=theStudent.semester
                  const particularSection=theStudent.section
                  const subjectsRecords=await subjectsDatabase.find({'details.semester':particularSemister,'details.section':particularSection})
                  subjectsRecords.forEach(record=>{
                    theSubjects=record.details.subjects
                    theSubjects.forEach(theSubject=>{
                      subjects.push(theSubject)
                    })
                  })
                  req.user={username,theId,subjects:subjects,theName,section:particularSection,semester:particularSemister,token,thePassword,password}
                  next()
                }
              }else{
                    res.json({msg:'wrong Password'})
                  } 
              }else if(username=='admin'){
                if(password==thePassword){
                  next()
                }else{
                  res.json({msg:'wrong password'})
                }
              }
              
          }
      });
      } catch (error) {
        throw new UnauthenticatedError('Not authorized to access this route')
      }
    }  
}
}

module.exports = authenticationMiddleware
