const express=require('express')
const router=express.Router()
const {createUser, userLogin  }=require('../controller/userController')
const {createBook,getBooks,getBookByQuery,updateBookById, deleteBookById}=require('../controller/bookController')
const {authentication,authorization}=require('../middlewares/authMiddleware')
router.post('/register',createUser)
router.post('/login',userLogin)
router.post('/books',authentication,authorization,createBook)
router.get('/books/:bookId',getBooks)
router.get('/books',getBookByQuery)
router.put('/books/:bookId',authentication,authorization,updateBookById)
router.delete('/books/:bookId',authentication,authorization,deleteBookById)




module.exports=router
