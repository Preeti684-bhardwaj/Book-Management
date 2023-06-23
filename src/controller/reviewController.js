const reviewModel = require("../model/reviewModel")
const bookModel = require("../model/bookModel")
const {isValid,isValidRating,isValidRequestBody,isValidObjectId}= require("../utils/validator")

const createReview= async function(req,res){
     try{
        let bookId=req.params.bookId
        let {review,rating,reviewedBy}=req.body
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,message:"book ID is not a valid ObjectID"})
        }
        if(!isValidRequestBody(req.body)) return res.status(400).send({
            status: false,
            message: "Please provide data for creating review",
          });
        if(!review){return res.status(400).send({status:false,message:"review is required"})}
        if(!isValid(review)) return res.status(400).send({status: false,
                message: "Please provide valid review for this book"})
        
        //reviewAt validations??
        if(!rating) return res.status(400).send({status: false,
            message: "Please provide your rating for this book"})
        if(!isValidRating(rating)) return res.status(400).send({status: false,
            message: "Please provide valid rating for this book"})

        if(!reviewedBy) return res.status(400).send({status: false,
            message: "Please provide your name for reviewing this book"})
        if(!isValid(reviewedBy)) return res.status(400).send({status: false,
            message: "Please provide valid name "})
        
        let book= await bookModel.findOne({_id:bookId,isDeleted:false})
        //book existence
        if(!book) return res.status(400).send({status:false,message:"There is no book with this Id"})
          await reviewModel.create({...req.body,bookId:bookId,reviewedAt:new Date()})

        //updating review count in book doc
        let reviewedBook= await bookModel.findOneAndUpdate({_id:bookId},{ $inc: { reviews: 1 }},{new:true})

        //finding all reviews with given bookId
        let reviewArr= await reviewModel.find({bookId:bookId})

        //created result object for storing the response data 
        let result={...reviewedBook._doc}
        //added reviewArray in the result object
        result.reviewsData=reviewArr
        
        return res.status(200).send({status:true,message:"Review added successfully",data:result})
        }
        catch(error){
            return res.status(500).send({status:false,message:error.message})
        }
}
const updateReview = async function(req,res){
    try{
        let bookId= req.params.bookId
        let reviewId= req.params.reviewId
        let {review, rating,reviewedBy}=req.body
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,message:"book ID is not a valid ObjectID"})
        }
        if(!isValidObjectId(reviewId)){
            return res.status(400).send({status:false,message:"review ID is not a valid ObjectID"})
        }
        if(!isValidRequestBody(req.body)) return res.status(400).send({
            status: false,
            message: "Please provide data for updating review",
          });
        if(review){
        if(!isValid(review)) return res.status(400).send({status: false,message: "Please provide valid review for this book"})
        }
        if(rating){
        if(!isValidRating(rating)) return res.status(400).send({status: false,message: "Please provide valid rating for this book"})
        }
        if(reviewedBy){
        if(!isValid(reviewedBy)) return res.status(400).send({status: false,message: "Please provide valid name "})
        }  
        //book existence
        let book= await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!book) return res.status(400).send({status:false,message:"Please provide correct bookId or the book is deleted"})
        //review Doc existence
        let reviewDoc= await reviewModel.findOne({_id:reviewId,isDeleted:false})
        if(!reviewDoc) return res.status(400).send({status:false,message:"Please provide correct reviewId or the review is deleted"})

        await reviewModel.findByIdAndUpdate(reviewId,req.body)

        //finding all reviews with given bookId
        let reviewArr= await reviewModel.find({bookId:bookId})
        let result={...book._doc}
        result.reviewsData=reviewArr
        return res.status(200).send({status: true,message: 'Books list',data:result})
    }
    catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}
const deleteReview = async function(req,res){
    try{
        let bookId= req.params.bookId
        let reviewId= req.params.reviewId
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,message:"book ID is not a valid ObjectID"})
        }
        if(!isValidObjectId(reviewId)){
            return res.status(400).send({status:false,message:"review ID is not a valid ObjectID"})
        }
        //review Doc existence
        let reviewDoc= await reviewModel.findOne({_id:reviewId,isDeleted:false})
        if(!reviewDoc) return res.status(400).send({status:false,message:"Please provide correct reviewId or the review is deleted"})
        //book existence
        let book= await bookModel.findById({_id:bookId,isDeleted:false})
        if(!book) return res.status(400).send({status:false,message:"Please provide correct bookId or the book is deleted"})

        let reviewDta= await reviewModel.findByIdAndUpdate(reviewId,{isDeleted:true})
        // if(!delReview) return res.status(400).send({status:false,message:"Already deleted review"})
       
        // await bookModel.findOneAndUpdate({_id:bookId},{ $inc: { reviews: -1 }},{new:true})
        if(reviewDta)
        {
            await bookModel.findOneAndUpdate({_id:bookId},{ $inc: { reviews: -1 }},{new:true})
        }
        return res.status(200).send({status: true,message: 'Review deleted succesfully!!'})

    }
    catch(error){
        return res.status(500).send({status:false,message:error.message})
    }
}
module.exports={createReview,updateReview,deleteReview}