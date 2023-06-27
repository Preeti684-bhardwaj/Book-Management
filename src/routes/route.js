const express=require('express')
const router=express.Router()
const {createUser, userLogin  }=require('../controller/userController')
const {createBook,getBooks,getBookByQuery,updateBookById, deleteBookById,createAwsFile}=require('../controller/bookController')
const{createReview,updateReview,deleteReview}=require('../controller/reviewController')
const {authentication,authorization}=require('../middlewares/authMiddleware')

router.post('/register',createUser)
router.post('/login',userLogin)

router.post('/books',authentication,createBook)
router.get('/books/:bookId',authentication,getBooks)
router.get('/books',authentication,getBookByQuery)
router.put('/books/:bookId',authentication,authorization,updateBookById)
router.delete('/books/:bookId',authentication,authorization,deleteBookById)

router.post("/books/:bookId/review",createReview)
router.put("/books/:bookId/review/:reviewId",updateReview)
router.delete("/books/:bookId/review/:reviewId",deleteReview)

router.post("/write-file-aws",createAwsFile)

module.exports=router
