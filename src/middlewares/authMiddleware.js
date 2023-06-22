const jwt = require("jsonwebtoken");
const validator = require("../utils/validator");
const bookModel=require('../model/bookModel')
const dotenv =require('dotenv').config()
const {SECRET_KEY}=process.env;


const authentication = function (req, res, next) {
    try {
        const token = req.headers["x-api-key"];
        if (!token) {
            return res.status(401).send({ status: false, message: "token is missing" });
        }

            const decodedToken = jwt.verify(token, SECRET_KEY); 
            req.decodedToken = decodedToken.userId;
            next();
    } catch(error){
      if(error.message =="Invalid token"){
          return res.status(401).send({status : false, message : "Enter valid token"})
      }
      return res.status(500).send({status : false, message : error.message})
  }
}


const authorization = async function (req, res, next) {
    try {
      const userLoggedIn = req.decodedToken; 
      if(req.params.bookId){
      const bookId = req.params.bookId;
       if (!validator.isValidObjectId(bookId)) {
        return res.status(401).send({status: false,message: `${bookId} is not a valid book id`,
      });
    }
      const book = await bookModel.findById({_id:bookId});
      if (!book) {
        return res.status(404).send({ status: false, message: "Book not found" });
      }
  
      if (book.isDeleted) {
        return res.status(400).send({ status: false , message : "Book is already deleted"});
      }
  
      const userToBeModified = book.userId;
  
      if (userToBeModified != userLoggedIn) {
        return res.status(403).send({ status: false, message: "User logged in is not allowed to modify the requested user's data" });
      }
      next();
      }
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
module.exports={authentication,authorization}
