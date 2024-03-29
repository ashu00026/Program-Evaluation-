const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");
const {
  staffDatabase,
  subjectsDatabase,
  studentDatabase,
  passwordsDatabase,
  adminsDatabase,
} = require("../model/schema");
const { BadRequestError } = require("../errors");
const bcrypt = require("bcryptjs");

const authenticationMiddleware = async (req, res, next) => {
  console.log("auth!!!!");
  console.log(req.body);
  // console.log(req)
  console.log(req.headers);

  if (!req.body.isRegistered) {
    console.log("register request!");
    next();
  } else {
    const authHeader = req.headers.authorization;
    const { theUser, thePassword, email } = req.body;
    if (!theUser || !thePassword) {
      throw new BadRequestError("Please provide email and password");
    } else {
      let token = "";
      const username = theUser;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.log("++++++++++++++++++++");
        // throw new UnauthenticatedError('No token provided')
        token = jwt.sign({ username }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
      } else {
        console.log("------------------");
        token = authHeader.split(" ")[1];
        console.log(token);
      }
      try {
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
              console.log("33333");
              // req.decoded = decoded;
              // req.authenticated = true;
              console.log(decoded);
              const { username } = decoded;
              // const password='student'
              console.log(theUser, username, "+++++++++++");
              // if(username){
              if (username !== theUser) {
                res.status(401).json({
                  msg: "you are not authorized to access this route",
                });
              }else{
                console.log("*****")
                const passwordsRecord = await passwordsDatabase.findOne({
                _id: "63d8ff2a763e582eb05f6bd8",
              });
              if (username == "staff") {
                // console.log(password)
                console.log(thePassword);
                const password = await passwordsRecord.staffPass;
                const isMatch = await bcrypt.compare(thePassword, password);

                if (isMatch) {
                  console.log(email);
                  const theStaff = await staffDatabase.findOne({ email });
                  if (theStaff == null) {
                    console.log("+");
                    res.status(401).json({ msg: "wrong credentials ++++" });
                  } else {
                    const staffSubjects = [];
                    const theId = theStaff.id;
                    const theName = theStaff.name;
                    const subjectsRecord = await subjectsDatabase.find({
                      name: theName,
                    });
                    subjectsRecord.forEach((record) => {
                      const subjects = record.details.subjects;
                      subjects.forEach((subject) => {
                        staffSubjects.push(subject);
                      });
                    });

                    req.user = {
                      theId,
                      theName,
                      staffSubjects,
                      token,
                      username,
                      thePassword,
                      password,
                    };
                    next();
                  }
                } else {
                  res.status(401).json({ msg: "Wrong Password" });
                }
              } else if (username == "student") {
                const password = await passwordsRecord.studentPass;
                const isMatch = await bcrypt.compare(thePassword, password);
                if (isMatch) {
                  // console.log(theName)
                  // console.log(theId)
                  const theStudent = await studentDatabase.findOne({ email });
                  console.log("the STudent", theStudent);

                  if (theStudent == null) {
                    console.log("-");
                    res.status(401).json({ msg: "wrong credentials" });
                  } else {
                    const theId = theStudent.studentId;
                    const theName = theStudent.name;
                    const subjects = [];
                    console.log(theStudent);
                    const particularSemister = theStudent.semester;
                    const particularSection = theStudent.section;
                    const subjectsRecords = await subjectsDatabase.find({
                      "details.semester": particularSemister,
                      "details.section": particularSection,
                    });
                    subjectsRecords.forEach((record) => {
                      const theSubjects = record.details.subjects;
                      theSubjects.forEach((theSubject) => {
                        subjects.push(theSubject);
                      });
                    });
                    req.user = {
                      username,
                      theId,
                      subjects: subjects,
                      theName,
                      section: particularSection,
                      semester: particularSemister,
                      token,
                      thePassword,
                      password,
                    };
                    next();
                  }
                } else {
                  res.status(401).json({ msg: "wrong Password" });
                }
              } else if (username == "admin") {
                console.log("adminnnnnnnnnnnnnnnnnnnn")
                const password = await passwordsRecord.adminPass;
                const isMatch = await bcrypt.compare(thePassword, password);
                console.log(isMatch)


                if(isMatch){
                  const theAdmin = await adminsDatabase.findOne({ email });
                  console.log("1")
                  if (theAdmin == null) {
                    console.log("+");
                    res.status(401).json({ msg: "wrong credentials ++++" });
                  }else {
                    const theId=theAdmin.id;
                    const theName=theAdmin.name;
                    const theDepartment=theAdmin.department
                    console.log("2")
                    // const username
                    

                    req.user = {
                      theId,
                      theName,
                      token,
                      department:theDepartment,
                      username,
                      thePassword,
                      password,
                    };
                    console.log(req.user)
                    console.log("3")
                    next();
                  }
                }else{
                  res.status(401).json({msg:"Wrong Password"})
                }
              }
              }
              // }
              
              
            }
          }
        );
      } catch (error) {
        throw new UnauthenticatedError("Not authorized to access this route");
      }
    }
  }
};

module.exports = authenticationMiddleware;
