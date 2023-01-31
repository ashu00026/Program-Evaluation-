const express = require('express')
const router = express.Router()
const { login, 
    register,addSubject,getStudent,getFaculty,getAllResults,getResult,
    addProblem,getQuestions,getQuestion,addpasswords
    // deleteSubject 
} = require('../controllers/main')

router.route('/assistant/register').post(register)
router.route('/login').post(login)
router.route('/assistant/register/f/addSubjects').post(addSubject)
router.route('/login/getStudent').get(getStudent)
router.route('/login/getStaff').get(getFaculty)
router.route('/login/getAllResults').get(getAllResults)
router.route('/login/getResult').get(getResult)
router.route('/faculty/addQuestions').post(addProblem)
router.route('/student/getQuestions').post(getQuestions)
router.route('/student/getQuestion').get(getQuestion)
router.route('/addpasswords').post(addpasswords)
// router.route('/assistant/register/f/deleteSubjects').post(deleteSubject)
    
    
// router.route('/login/admin').post(login)
// router.route('/login/assistant').post(login)
// router.route('/login/faculty').post(login)
// router.route('/login/student').post(login)


module.exports = router
