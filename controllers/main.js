require("dotenv").config();
const bcrypt = require("bcryptjs");
const { UnauthenticatedError } = require("../errors");

const {
  studentDatabase,
  staffDatabase,
  resultsDatabase,
  subjectsDatabase,
  questionsDatabase,
  passwordsDatabase,
  adminsDatabase,
} = require("../model/schema");

const jwt = require("jsonwebtoken");
const { BadRequestError } = require("../errors");
const e = require("express");

// const deleteSubject=async(req,res)=>{
//   const {subName,semester} = req.body
//   console.log(req.body)

const addpasswords = async (req, res) => {
  console.log("passwords");
  const { adminPass, staffPass, studentPass, jwtSecret } = req.body;
  console.log(req.body);
  try {
    await passwordsDatabase.create({
      adminPass,
      staffPass,
      studentPass,
      jwtSecret,
    });
  } catch (e) {
    console.log(e);
  }
  console.log("done!");
  res.json({ msg: "created the passwords" });
};

// }

const deleteQuestion = async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ msg: "unauthenticated User" });
  } else {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async (err, decoded) => {
        const { id } = req.body;
        console.log(id);
        const { username } = decoded;
        if (username == "staff") {
          const deleteReq = await questionsDatabase.findByIdAndDelete(
            id,
            async (err, done) => {
              if (err) {
                res.json({ msg: "nnot possible" });
              } else {
                if (done == null) res.json({ msg: "no question found " });
                else {
                  console.log("_----------------_");
                  const subject = done.subject;
                  const semester = done.semester;
                  const department = done.department.toUpperCase();
                  console.log("department", department);
                  console.log("subject", subject);
                  console.log("semester", semester);
                  const questionNumber = done.questionNumber;
                  const records = await resultsDatabase.find({
                    semester,
                    subjectName: subject,
                    department,
                  });
                  const noOfExpQuestions = await questionsDatabase.find({
                    subject: subject,
                    semester,
                    department: department,
                  });
                  // console.log("----------------", noOfExpQuestions);
                  const totalnoOfExpQuestions = noOfExpQuestions.length;
                  console.log(totalnoOfExpQuestions, "no of questions");
                  console.log(records, "the RECORDS");
                  records.forEach(async (record) => {
                    const theArray = record.results;
                    console.log(questionNumber);
                    theArray[questionNumber - 1] = 0;
                    // theArray[15] =
                    //   (theArray[15] *
                    //   ((totalnoOfExpQuestions+1)  / (totalnoOfExpQuestions )));
                    //   if(theArray[15]>15){
                    //     theArray[15]=15;
                    //   }
                    let total = 0;
                    for (let i = 0; i < 15; i++) {
                      total = total + theArray[i];
                    }
                    let ave;
                    if (totalnoOfExpQuestions == 0) {
                      ave = 0;
                      console.log("if");
                    } else {
                      console.log("elsee");
                      console.log(total, totalnoOfExpQuestions);

                      ave = total / totalnoOfExpQuestions;
                    }
                    theArray[15] = ave;
                    console.log(theArray, "check average now at 15");
                    let grandTotal = 0;
                    console.log("3");
                    for (let j = 15; j < theArray.length - 1; j++) {
                      console.log(theArray[j]);
                      grandTotal = grandTotal + Number(theArray[j]);
                    }
                    console.log(grandTotal, "grand total");
                    theArray[18] = Math.ceil(grandTotal);
                    console.log(
                      ave,
                      theArray,
                      "check average and array to patch"
                    );
                    //find result and update----------------------------
                    const theID = record["_id"];
                    await resultsDatabase.updateOne(
                      { _id: theID },
                      { results: theArray }
                    );
                  });
                  res.json({ msg: "deleted successfully", object: done });
                }
              }
            }
          );
        }
      }
    );
  }

  // if(deleteReq){
  //   res.json({msg:"deleted sucessfully"})
  // }else{
  //   res.json()

  // }
};

const register = async (req, res) => {
  const authHeader = req.headers.authorization;
  console.log(
    req.headers,
    authHeader,
    "----------------------------------------------------------------"
  );
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ msg: "unauthenticated User" });
  } else {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        console.log("22222");
        if (err) {
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
        } else {
          const { username } = decoded;
          theUser = username;
          if (theUser == "staff" || theUser == "admin") {
            //roles

            //code goes here
            const {
              username,
              password,
              name,
              theSemester,
              adminId,
              studentId,
              staffId,
              section,
              email,
              mobileNumber,
              department,
            } = req.body;
            const passwordsRecord = await passwordsDatabase.findOne({
              _id: "63d8ff2a763e582eb05f6bd8",
            });
            console.log(req.body);
            console.log(username, password);
            console.log(adminId);
            console.log(section);
            if (!username || !password) {
              throw new BadRequestError("Please provide email and password");
            } else {
              if (username == "admin") {
                console.log("inside right direction");
                console.log(password);
                // console.log(process.env.Admin_pass)

                const adminPass = await passwordsRecord.adminPass;
                const isMatch = await bcrypt.compare(password, adminPass);
                console.log(isMatch);

                // const id = new Date().getDate()
                try {
                  if (isMatch) {
                    console.log(`insisde the admin if block!`);
                    const duplicate = await adminsDatabase.findOne({
                      id: adminId,
                    });
                    console.log(duplicate);
                    if (duplicate == null) {
                      const theDepartmentOfAdmin =
                        await department.toUpperCase();
                      await adminsDatabase.create({
                        name,
                        email,
                        mobileNumber,
                        id: adminId,
                        department: theDepartmentOfAdmin,
                      });
                      // console.log(adminToken)
                      res.status(200).json({
                        msg: "admin created",
                        name,
                        email,
                        mobileNumber,
                        adminId,
                        department,
                        // "adminToken":adminToken
                      });
                    } else {
                      res.status(200).json({ msg: "please provide and id" });
                    }
                  } else {
                    res.status(200).json({ msg: "invalid password" });
                  }
                } catch (e) {
                  console.log(e);
                }
              } else if (username == "student") {
                console.log("inside student right direction");
                console.log(password);
                console.log(name);
                console.log(theSemester);
                console.log(studentId);

                // await subjectsDatabase.create({name:'madam1',details:{semester:8,subjects:["dbms"]}})///remove when staff & subjects both are added
                console.log(passwordsRecord);
                const studentPass = passwordsRecord.studentPass;
                console.log("student password:", studentPass);
                console.log("password given", password);
                const isMatch = await bcrypt.compare(password, studentPass);
                console.log("compared", isMatch);
                if (isMatch) {
                  const duplicate = await studentDatabase.findOne({
                    name: name,
                    studentId,
                  });
                  console.log(name);
                  console.log(duplicate);

                  try {
                    if (duplicate == null) {
                      console.log("insside the duplicates");
                      const arr = new Array(19).fill(0);
                      // const arr[]={0}
                      const theDepartmentOfStudent =
                        await department.toUpperCase();
                      await studentDatabase.create({
                        studentId: studentId,
                        name: name,
                        semester: theSemester,
                        section: section,
                        email,
                        mobileNumber,
                        department: theDepartmentOfStudent,
                      });
                      // const test=await subjectsDatabase.find()
                      // console.log("testing",test)
                      const subjectRecords = await subjectsDatabase.find({
                        "details.semester": Number(theSemester),
                        "details.section": section,
                      });
                      console.log(subjectRecords);
                      subjectRecords.forEach((subjectRecord) => {
                        const subjectsArr = subjectRecord.details.subjects;
                        subjectsArr.forEach((subjectName) => {
                          const subject = subjectName.toUpperCase();
                          resultsDatabase.create({
                            studentid: studentId,
                            studentName: name,
                            semester: theSemester,
                            section: section,
                            department: theDepartmentOfStudent,
                            subjectName: subject,
                            results: arr,
                          });
                        });
                      });
                      // const studentToken = jwt.sign({username,password}, process.env.JWT_SECRET, {
                      //   expiresIn: '30d',
                      // })
                      // console.log(studentToken)
                      res.status(200).json({
                        msg: "student created",
                        "name of the student: ": name,
                        semester: theSemester,
                        section: section,
                        id: studentId,
                        // "token":studentToken,
                        email,
                        mobileNumber,
                      });
                    } else {
                      res.json({ msg: "please provide unique id" });
                    }
                  } catch (e) {
                    res.json({ msg: e.message });
                  }
                } else {
                  res.json({ msg: "wrong credentials" });
                }
              } else if (username == "staff") {
                console.log("inside right direction");
                console.log("name: ", name);
                // console.log("subjects :",subjects)
                console.log(password);
                // console.log(process.env.Staff_pass)
                const theDepartmentOfUser = await department.toUpperCase();

                const staffPass = passwordsRecord.staffPass;
                const isMatch = await bcrypt.compare(password, staffPass);
                console.log(isMatch);
                if (isMatch) {
                  // if(!staffs.includes(name)){
                  //   staffDatabase.create({name:name,subjects:subjects})
                  //   staffs.push(name)}
                  const duplicateStaff = await staffDatabase.findOne({
                    name: name,
                    id: staffId,
                  });
                  console.log(duplicateStaff);
                  try {
                    if (duplicateStaff == null) {
                      await staffDatabase.create({
                        name: name,
                        id: staffId,
                        email,
                        mobileNumber,
                        department: theDepartmentOfUser,
                      }); //try catch
                      // const id = new Date().getDate()
                      console.log(`insisde the staff if block!`);
                      //   const staffToken = jwt.sign({password,username}, process.env.JWT_SECRET, {
                      //   expiresIn: '30d',
                      // })
                      // console.log(staffToken)
                      res.status(200).json({
                        msg: "staff created",
                        "Name of Staff: ": name,
                        // "token":staffToken,
                        email,
                        mobileNumber,
                        department,
                      });
                    } else {
                      res.status(200).json({
                        msg: `staff with name ${name} and id ${staffId} already exists`,
                      });
                    }
                  } catch (err) {
                    console.log(err.message);
                    res.status(200).json({ msg: err.message });
                  }
                }
              }
            }
          } else {
            res
              .status(401)
              .json({ msg: "you are not authorized for this route" });
          }
        }
      }
    );

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
};

// const getAdmin= async(req,res)=>{
const getAdmin = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("+++++++");
    console.log(!authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ msg: "unauthenticated user" });
    } else {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        async function (err, decoded) {
          console.log("22222");
          if (err) {
            console.log(err);
            req.authenticated = false;
            req.decoded = null;
          } else {
            const { username } = decoded;
            if (username == "admin") {
              //roles
              //code goes here
              console.log("inside get admin");
              const id = req.query.id;
              console.log(id);
              const admin = await adminsDatabase.findOne({ id });
              console.log(admin);
              if (admin == null) {
                res.status(200).json({ msg: "no User found with this id" });
              } else {
                const department = admin.department.toUpperCase();
                const name = admin.name;
                const email = admin.email;
                const mobileNumber = admin.mobileNumber;

                const theRecords = await subjectsDatabase.find({
                  department,
                });
                if (theRecords == null) {
                  res
                    .status(200)
                    .json({ msg: "no record found for the department" });
                } else {
                  let theDetailsOfSubjects = [];
                  let theStaff = new Set([]);
                  theRecords.forEach((record) => {
                    // let theSubjects = [];
                    let subjects = record.details.subjects;
                    subjects.forEach((subject) => {
                      const semester = record.details.semester;
                      const section = record.details.section;
                      const staffName = record.name;
                      const department = record.department;
                      // theStaff.add(staffName);
                      // theSubjects=theSubjects[0]
                      theDetailsOfSubjects.push({
                        subjects: subject,
                        staffName,
                        semester,
                        section,
                      });
                    });
                    // subjects.forEach((subject) => {
                    // });
                    // const theSubjects=subject;
                  });
                  const completeStaff = await staffDatabase.find({
                    department,
                  });
                  completeStaff.forEach((staff) => {
                    theStaff.add(staff.name);
                  });

                  console.log(theDetailsOfSubjects);
                  let subjects = [];
                  theDetailsOfSubjects.forEach((detail) => {
                    // const array = detail.theSubjects;
                    subjects.push(detail.subjects);
                  });
                  console.log(subjects);
                  theStaff = [...theStaff];
                  console.log(theStaff);
                  res
                    .status(200)
                    .json({ subjects, theStaff, theDetailsOfSubjects });
                }
              }
              // res.json("done")
            } else {
              res.status(401).json({ msg: "not authorized for this route" });
            }
          }
        }
      );
    }
  } catch (e) {
    console.log(e);
    res.status(200).json({ msg: e });
  }
};

// }

const login = async (req, res) => {
  console.log("4");
  // const requestedName=req.body.name
  const {
    username,
    theName,
    staffSubjects,
    theId,
    subjects,
    section,
    semester,
    token,
    thePassword,
    password,
    department,
  } = req.user;
  const passwordsRecord = await passwordsDatabase.findOne({
    _id: "63d8ff2a763e582eb05f6bd8",
  });
  console.log(req.user);
  console.log(username, theName, section, semester);
  // const {password}=req.body
  // mongoose validation
  // Joi
  // check in the controller
  if (username == "admin") {
    console.log("inside right direction");
    console.log(thePassword);
    console.log(password);
    // console.log(process.env.Admin_pass)
    const adminPass = passwordsRecord.adminPass;
    const isMatch = await bcrypt.compare(thePassword, adminPass);
    console.log(isMatch);
    if (isMatch) {
      console.log(`insisde the admin if block!`);
      res.status(200).json({ username, theName, token, theId, department });
    } else {
      res.status(401).json({ msg: "wrong credentials" });
    }
  } else if (username == "student") {
    console.log("student");
    console.log(theName);
    console.log(semester);
    console.log(section);
    console.log(theId);
    console.log(subjects);
    console.log(password);
    // console.log(password)
    // const password='student'///make it manual------------------------------------
    // console.log(process.env.Student_pass)
    console.log("unnchanged");
    const studentPass = passwordsRecord.studentPass;
    const isMatch = await bcrypt.compare(thePassword, studentPass);
    console.log(isMatch);
    if (isMatch) {
      console.log("innn");
      res
        .status(200)
        .json({ username, theName, section, semester, token, subjects, theId });
    } else {
      res.status(401).json({ msg: "wrong credentials" });
    }
  } else if (username == "staff") {
    console.log("staff");
    console.log(theName, staffSubjects);
    console.log(theId);
    console.log(username);
    console.log(thePassword, "thepassword");
    // console.log(process.env.Staff_pass)
    const staffPass = passwordsRecord.staffPass;
    const isMatch = await bcrypt.compare(thePassword, staffPass);
    console.log(isMatch);
    if (isMatch) {
      console.log("innnn");
      res.status(200).json({ theName, staffSubjects, theId, username, token });
    } else {
      res.status(401).json({ msg: "wrong credentials" });
    }
  }
};

const addSubject = async (req, res) => {
  console.log("++++");

  const authHeader = req.headers.authorization;
  console.log("+++++++");
  console.log(!authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ msg: "unauthenticated user" });
  } else {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        console.log("22222");
        if (err) {
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
        } else {
          const { username } = decoded;
          if (username == "staff" || username == "admin") {
            //roles

            //code goes here
            console.log("inside add subject");
            let { name, semester, subject, section, department } = req.body;
            const theDepartmentOfStudent = await department.toUpperCase();
            try {
              const allSubjectsOfSemester = [];
              const nonDuplicateSubjectRecord = await subjectsDatabase.find({
                "details.semester": semester,
                "details.section": section,
                department: theDepartmentOfStudent,
              });
              nonDuplicateSubjectRecord.forEach((record) => {
                const beforeSubjects = record.details.subjects;
                beforeSubjects.forEach((subject) => {
                  allSubjectsOfSemester.push(subject);
                });
              });
              subject = subject.toUpperCase();
              if (allSubjectsOfSemester.includes(subject)) {
                res.status(200).json({
                  msg: `the subject is already assigned for the section`,
                });
              } else {
                // await subjectsDatabase.create({name:name,details:{semester:semester,subjects:arrSubjects}})
                const duplicateEntry = await subjectsDatabase.findOne({
                  name: name,
                  "details.semester": semester,
                  "details.section": section,
                  department: theDepartmentOfStudent,
                });
                console.log(duplicateEntry);
                // console.log(duplicateEntry.details.subjects)
                if (duplicateEntry == null) {
                  console.log("duplicate ==null");
                  const arrSubjects = [];
                  arrSubjects.push(subject);
                  console.log(arrSubjects);
                  await subjectsDatabase.create({
                    name: name,
                    department: theDepartmentOfStudent,
                    details: {
                      semester: semester,
                      section: section,
                      subjects: arrSubjects,
                    },
                  });
                  const theStudentsAlreadyPresent = await studentDatabase.find({
                    semester,
                    department: theDepartmentOfStudent,
                    section,
                  });
                  theStudentsAlreadyPresent.forEach(async (student) => {
                    const arr = new Array(19).fill(0);
                    const studentId = await student.studentId;
                    const theStudentName = await student.name;
                    const theSemester = await student.semester;
                    const TheSection = await student.section;
                    const theDepartmentofHim = await student.department;
                    const subjectName = subject;
                    await resultsDatabase.create({
                      studentid: studentId,
                      studentName: theStudentName,
                      semester: theSemester,
                      section: TheSection,
                      department: theDepartmentofHim,
                      subjectName: subjectName,
                      results: arr,
                    });
                  });
                  res.status(200).json({
                    msg: `subject added to the faculty`,
                    presentSubjects: arrSubjects,
                  });
                } else {
                  const presentSubjects = duplicateEntry.details.subjects;
                  if (!presentSubjects.includes(subject)) {
                    //update the subjects array in the db
                    await presentSubjects.push(subject);
                    console.log(presentSubjects);
                    await subjectsDatabase.findOneAndUpdate(
                      {
                        name: name,
                        department: theDepartmentOfStudent,
                        "details.semester": semester,
                        "details.section": section,
                      },
                      { "details.subjects": presentSubjects },
                      { new: true, runValidators: true }
                    );
                    const theStudentsAlreadyPresent =
                      await studentDatabase.find({
                        semester,
                        department: theDepartmentOfStudent,
                        section,
                      });
                    theStudentsAlreadyPresent.forEach(async (student) => {
                      const arr = new Array(19).fill(0);
                      const studentId = await student.studentId;
                      const theStudentName = await student.name;
                      const theSemester = await student.semester;
                      const TheSection = await student.section;
                      const theDepartmentofHim = await student.department;
                      const subjectName = subject;
                      await resultsDatabase.create({
                        studentid: studentId,
                        studentName: theStudentName,
                        semester: theSemester,
                        section: TheSection,
                        department: theDepartmentofHim,
                        subjectName: subjectName,
                        results: arr,
                      });
                    });
                    res.status(200).json({
                      msg: `updated the subject of the staff ${name}`,
                      subjects: presentSubjects,
                    });
                  } else {
                    res.status(200).json({
                      msg: `the subject is already present for the staff ${name}`,
                      presentsubjects: presentSubjects,
                    });
                  }
                }
              }
            } catch (err) {
              console.log(err.message);
            }
          } else {
            res
              .status(401)
              .json({ msg: "you are not authorized for this route" });
          }
        }
      }
    );
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
};

const management = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("No token provided");
  } else {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        console.log("22222");
        if (err) {
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
        } else {
          const { username } = decoded;
          if (username == "admin") {
            const { dataToUpdate, updatedData,department } = req.body;
            console.log(dataToUpdate, updatedData);
            for (let i = 0; i < dataToUpdate.length; i++) {
              // for(int data=0;data<dataToUpdate.length;data++){}
              const staffNameToUpdate = dataToUpdate[i].staffName;
              const updatedStaffName = updatedData[i].staffName;
              const subjectToDelete = dataToUpdate[i].subjects;
              const semester = dataToUpdate[i].semester;
              const section = dataToUpdate[i].section;
              console.log(
                staffNameToUpdate,
                subjectToDelete,
                semester,
                section,
                updatedStaffName
              );
              const deleteStaffSubejct = await subjectsDatabase.findOne({
                name: staffNameToUpdate,
                department:department,
                "details.semester": semester,
                "details.section": section,
              });
              let staffSubjects = deleteStaffSubejct.details.subjects;
              const theDbId = deleteStaffSubejct["_id"];
              if (staffSubjects.includes(subjectToDelete)) {
                let theStaffSubjectsAfterDeleting = staffSubjects.filter(
                  (subject) => subject !== subjectToDelete
                );
                await subjectsDatabase.findByIdAndUpdate(
                  theDbId,
                  { "details.subjects": theStaffSubjectsAfterDeleting },
                  (err, result) => {
                    if (err) {
                      res.json({ msg: "some error" });
                    } else {
                      console.log(result);
                      // res.json({ msg: "done" });
                    }
                  }
                );
                const theStaffToUpdate = await subjectsDatabase.findOne({
                  name: updatedStaffName,
                  department:department,
                  "details.semester": semester,
                  "details.section": section,
                });
                if (theStaffToUpdate==null) {
                  let theStaffSubject=[]
                  theStaffSubject.push(subjectToDelete)
                   await subjectsDatabase.create({
                    name: updatedStaffName,
                    department: department,
                    details: {
                      semester: semester,
                      section: section,
                      subjects: theStaffSubject,
                    },
                  });
                  res.status(200).json({msg:"created and updated"})
                } else {
                  let theStaffSubjectsPresent =
                    theStaffToUpdate.details.subjects;
                  const theStaffId = theStaffToUpdate["_id"];
                  if (!theStaffSubjectsPresent.includes(subjectToDelete)) {
                    theStaffSubjectsPresent.push(subjectToDelete);
                    await subjectsDatabase.findByIdAndUpdate(
                      theStaffId,
                      { "details.subjects": theStaffSubjectsPresent },
                      (err, result) => {
                        if (err) {
                          res.json({ msg: "some error" });
                        } else {
                          console.log(result);
                          res.status(200).json({ msg: "done", result });
                        }
                      }
                    );
                  } else {
                    res
                      .status(401)
                      .json({ msg: "the staff already has the subject" });
                  }
                }
              } else {
                res
                  .status(401)
                  .json({ msg: "the staff doesnt have the subject" });
              }
            }
            // await subjectsDatabase.find({})

            //code goes here
          } else {
            res
              .status(401)
              .json({ msg: "you are not authorized for this route" });
          }
        }
      }
    );
  }
};

const getStudent = async (req, res) => {
  try {
    const studentID = req.query.studentId;
    console.log(studentID);
    const theStudent = await studentDatabase.findOne({ studentId: studentID });
    console.log(theStudent);
    console.log(theStudent.semester);

    const semester = theStudent.semester;
    const department = theStudent.department;
    const section = theStudent.section;
    console.log(semester, department, section);

    const theRecords = await subjectsDatabase.find({
      "details.semester": semester,
      "details.section": section,
      department,
    });
    let theDetailsOfSubjects = [];
    theRecords.forEach((record) => {
      let theSubjects = [];
      let subjects = record.details.subjects;
      subjects.forEach((subject) => {
        theSubjects.push(subject);
      });
      const staffName = record.name;
      theDetailsOfSubjects.push({ theSubjects, staffName });
    });
    console.log(theDetailsOfSubjects);
    let subjects = [];
    theDetailsOfSubjects.forEach((detail) => {
      const array = detail.theSubjects;
      subjects.push(...array);
    });
    console.log(subjects);
    // console.log(theRecords[0].details.subjects);
    // console.log(theSubjects)

    res.status(200).json({ theStudent, theDetailsOfSubjects, subjects });
  } catch (e) {
    console.log(e);
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(" ")[1];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthenticatedError("No token provided");
    } else {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        async function (err, decoded) {
          console.log("22222");
          if (err) {
            console.log(err);
            req.authenticated = false;
            req.decoded = null;
          } else {
            const { username } = decoded;
            if (username == "admin") {
              // const adminId=req.query.id;
              // console.log("admin id",adminId)
              const departments = await adminsDatabase.find({});
              let Alldepartments = new Set([]);
              departments.forEach((record) => {
                console.log(record.department);
                const department = record.department;
                Alldepartments.add(department);
              });
              Alldepartments = [...Alldepartments];
              res.status(200).json({ departments: Alldepartments });
              //roles
              //code goes here
            } else {
              res
                .status(401)
                .json({ msg: "you are not authorized for this route" });
            }
          }
        }
      );
    }
  } catch (e) {
    console.log(e);
  }
};

const getFaculty = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("No token provided");
  } else {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        console.log("22222");
        if (err) {
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
        } else {
          const { username } = decoded;
          if (username == "staff" || username == "admin") {
            //roles assigned
            const staffID = req.query.staffId;
            console.log(staffID);
            const theStaff = await staffDatabase.findOne({ id: staffID });
            const staffName = theStaff.name;
            console.log(staffName);
            const subjects = await subjectsDatabase.find({ name: staffName });
            console.log(theStaff);
            console.log(subjects);
            // console.log(subjects[0].details);
            // console.log(subjects[1].details);
            // console.log(subjects[2].details);
            res.status(200).json({ staff: theStaff, subjects: subjects });
          } else {
            res
              .status(401)
              .json({ msg: "you are not authorized for this route" });
          }
        }
      }
    );
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
};

const getAllResults = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("No token provided");
  } else {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        console.log("22222");
        if (err) {
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
        } else {
          const { username } = decoded;
          if (username == "staff" || username == "admin") {
            console.log("getAllResults");
            const theSubject = req.query.subject.toUpperCase();
            const theSemester = req.query.semester;
            const theDepartment = req.query.department.toUpperCase();
            const section = req.query.section;
            const results = await resultsDatabase.find({
              subjectName: theSubject,
              semester: theSemester,
              section: section,
            });
            console.log(results);
            if (!(results == null)) {
              const theResult = [];
              console.log(results);
              let count = 0;
              results.forEach((record) => {
                const name = record.studentName;
                const ID = record.studentid;
                const results = record.results;
                count = count + 1;
                theResult.push({
                  id: count,
                  name,
                  jntu: ID,
                  expmarks: results,
                });
              });
              res.status(200).json({ Result: theResult });
            } else {
              res.json({ msg: "Data not found" });
            }
          } else {
            res
              .status(401)
              .json({ msg: "you are not authorized for this route" });
          }
        }
      }
    );

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
};
const getResult = async (req, res) => {
  console.log("getResult");
  const ID = req.query.studentId;
  const theSubject = req.query.subject.toUpperCase();
  console.log(ID, theSubject);
  const studentRecord = await studentDatabase.findOne({ studentId: ID });
  const theStudentName = studentRecord.name;
  console.log(theStudentName);
  console.log(theSubject);
  console.log(ID);
  const result = await resultsDatabase.findOne({
    studentid: ID,
    subjectName: theSubject,
  });
  console.log(result);
  const theResult = result.results;
  res.status(200).json({
    studentId: ID,
    name: theStudentName,
    subject: theSubject,
    Result: theResult,
  });
};

const setaugumentedResult = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("No token provided");
  } else {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        console.log("22222");
        if (err) {
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
        } else {
          const { username } = decoded;
          if (username == "staff" || username == "admin") {
            //roles

            try {
              const { studentId, subjectName, marks } = req.body;
              const theSubject = subjectName.toUpperCase();
              console.log(theSubject, studentId);
              const theRecord = await resultsDatabase.findOne({
                studentid: studentId,
                subjectName: theSubject,
              });
              console.log(theRecord);
              if (marks > 5) {
                res.json({ msg: "not possible to give marks more than 5" });
              } else {
                if (theRecord == null) {
                  res.status(404).json({ msg: "student not found!!" });
                } else {
                  const updatingId = theRecord["_id"];
                  const theArray = theRecord.results;
                  theArray[16] = marks;
                  theArray[18] = theArray[17] + theArray[16] + theArray[15];
                  await resultsDatabase.findByIdAndUpdate(
                    updatingId,
                    { results: theArray },
                    (err, result) => {
                      if (err) {
                        res.json({ msg: "some error" });
                      } else {
                        console.log(result);
                        res.json({ msg: "done" });
                      }
                    }
                  );
                }
              }
              // theArray[]
            } catch (e) {
              console.log(e);
            }

            //code goes here
          } else {
            res
              .status(401)
              .json({ msg: "you are not authorized for this route" });
          }
        }
      }
    );
  }
};

const addProblem = async (req, res) => {
  console.log("+++++");

  const authHeader = req.headers.authorization;
  console.log("++++");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // throw new UnauthenticatedError('No token provided')
    res.json({ msg: "unauthenticated user" });
  } else {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      async function (err, decoded) {
        console.log("22222");
        if (err) {
          console.log(err);
          req.authenticated = false;
          req.decoded = null;
        } else {
          const { username } = decoded;
          if (username == "staff") {
            //roles
            console.log("inside add prblem");
            const {
              problemStatement,
              testCases,
              subject,
              semester,
              department,
              problemName,
              questionNumber,
              sampleOutput,
              sampleInput,
            } = req.body;
            const theproblemName = await problemName.toUpperCase();
            const theSubject = await subject.toUpperCase();
            const theDepartment = await department.toUpperCase();
            var testCaseCount = testCases.length;
            await questionsDatabase.create({
              problemStatement: problemStatement,
              problemName: theproblemName,
              testCases: testCases,
              subject: theSubject,
              testCasesCount: testCaseCount,
              semester: semester,
              department: theDepartment,
              questionNumber,
              sampleInput,
              sampleOutput,
            });
            const theResultRecords = await resultsDatabase.find({
              semester: semester,
              department: theDepartment,
              subjectName: theSubject,
            });
            console.log(theResultRecords, "++++++++++");
            theResultRecords.forEach(async (record) => {
              theArray = record.results;
              console.log(subject, semester, theDepartment);
              const theSubject = subject.toUpperCase();
              const noOfExpQuestions = await questionsDatabase.find({
                subject: theSubject,
                semester,
                department: theDepartment,
              });
              console.log("----------------", noOfExpQuestions);
              const totalnoOfExpQuestions = noOfExpQuestions.length;
              console.log(totalnoOfExpQuestions);
              theArray[15] =
                theArray[15] *
                ((totalnoOfExpQuestions - 1) / totalnoOfExpQuestions);
              const theID = record["_id"];
              let grandTotal = 0;
              console.log("3");
              for (let j = 15; j < theArray.length - 1; j++) {
                console.log(theArray[j]);
                grandTotal = grandTotal + Number(theArray[j]);
              }
              console.log(grandTotal, "grand total");
              theArray[18] = Math.ceil(grandTotal);
              console.log(theID);
              await resultsDatabase.updateOne(
                { _id: theID },
                { results: theArray }
              );
            });
            res.status(200).json({ msg: "problem added to subject!" });

            //code goes here
          } else {
            res
              .status(401)
              .json({ msg: "you are not authorized for this route" });
          }
        }
      }
    );

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
};

const getQuestions = async (req, res) => {
  console.log("inside getQuestions");
  const { subject, semester, department } = req.body;
  console.log(subject, semester, department);
  const theDepartment = await department.toUpperCase();
  const theSubject = await subject.toUpperCase();
  const questions = await questionsDatabase.find({
    subject: theSubject,
    semester: semester,
    department: theDepartment,
  });
  console.log("+++++++++++++++++", questions);
  if (questions.length == 0) {
    res.json({ msg: "no questions found for the subject" });
  } else {
    const questionsArray = [];
    // console.log(questions)
    questions.forEach((record) => {
      const theQuestion = record.problemName;
      const theProblemStatement = record.problemStatement;
      const theID = record["_id"];
      questionsArray.push({ theQuestion, theProblemStatement, theID });
    });
    res
      .status(200)
      .json({ msg: "The subject Problems", problems: questionsArray });
  }
};
// const facultyDashBoard=async(req,res)=>{
const getQuestion = async (req, res) => {
  console.log("inside the getQuestion");
  const { semester, problemName, department, subject } = req.query;
  console.log(semester, problemName, department, subject);
  const theDepartment = await department.toUpperCase();
  const theProblemName = await problemName.toUpperCase();
  const theSubject = await subject.toUpperCase();
  const theProblem = await questionsDatabase.findOne({
    semester: semester,
    department: theDepartment,
    subject: theSubject,
    problemName: theProblemName,
  });
  console.log(theProblem);
  console.log("ended");
  if (theProblem == null) {
    res.json({ msg: "this question doesnt exists" });
  } else {
    const theQuestionNumber = theProblem.questionNumber;
    const theTestCases = theProblem.testCases;
    const theProblemStatement = theProblem.problemStatement;
    const theProblemInput = theProblem.sampleInput;
    const theProblemOutput = theProblem.sampleOutput;
    const uniqueId = theProblem["_id"];
    res.json({
      testCases: theTestCases,
      questionNumber: theQuestionNumber,
      problemStatement: theProblemStatement,
      uniqueId,
      theProblemInput,
      theProblemOutput,
    });
  }
};

const submitResult = async (req, res) => {
  const {
    studentid,
    semester,
    section,
    department,
    questionNumber,
    subjectName,
    marks,
  } = req.body;
  try {
    console.log(subjectName);
    console.log(studentid);
    const theSubject = subjectName.toUpperCase();
    const theResultRecord = await resultsDatabase.findOne({
      studentid,
      subjectName: theSubject,
    });
    let grandTotal = 0;
    const theArray = theResultRecord.results;
    if (questionNumber === 16) {
      if (marks > 5) {
        res.json({ msg: "marks cannot be greater than 5" });
      } else {
        theArray[17] = marks;
        console.log("3");
        for (let j = 15; j < theArray.length - 1; j++) {
          console.log(theArray[j]);
          grandTotal = grandTotal + Number(theArray[j]);
        }
        console.log(grandTotal, "grand total");
        theArray[18] = Math.ceil(grandTotal);
      }
    } else {
      const subject = subjectName.toUpperCase();
      const theDepartment = department.toUpperCase();
      const noOfExpQuestions = await questionsDatabase.find({
        subject,
        semester,
        department: theDepartment,
      });
      console.log(noOfExpQuestions.length, "number of questions");
      // const theArray = theResultRecord.results;
      theArray[questionNumber - 1] = await marks;
      let total = 0;
      console.log("right");
      for (let i = 0; i < 15; i++) {
        total = total + Number(theArray[i]);
      }
      console.log(total);
      console.log("2");
      const average = Number(total / noOfExpQuestions.length);
      console.log(average);
      theArray[15] = Number(average);
      let grandTotal = 0;
      console.log("3");
      for (let j = 15; j < theArray.length - 1; j++) {
        console.log(theArray[j]);
        grandTotal = grandTotal + Number(theArray[j]);
      }
      console.log(grandTotal, "grand total");
      theArray[18] = Math.ceil(grandTotal);
      // theArray[19]=average;
      console.log("5");
    }
    await resultsDatabase.findOneAndUpdate(
      { studentid, subjectName: theSubject },
      { results: theArray }
    );
    console.log(theArray);
    res.json({ msg: "submitted sucessfully" });
  } catch (e) {
    console.log(e);
  }
};

// }

module.exports = {
  management,
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
  addpasswords,
  submitResult,
  // deleteSubject
  getAllDepartments,
  setaugumentedResult,
  deleteQuestion,
  getAdmin,
};
