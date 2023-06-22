const bookModel = require('../model/bookModel');
const userModel = require('../model/userModel');
const reviewModel = require('../model/reviewModel')
const { isValid, isValidRequestBody, isValidISBN } = require("../utils/validator");
const { isValidObjectId } = require('mongoose');

const createBook = async function (req, res) {
    try {
        const book = req.body;
        const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = book
        if (!isValidRequestBody(book))
            return res.status(400).send({ status: false, message: "Please provide data for creating book" });

        if (!title) {
            return res.status(400).send({ status: false, message: "Book title is required" });
        }
        if (!isValid(title)) return res.status(400).send({ status: false, message: "Please provide valid title" })

        if (!excerpt) {
            return res.status(400).send({ status: false, message: "Book excerpt is required" });
        }
        if (!isValid(excerpt)) return res.status(400).send({ status: false, message: "Please provide valid excerpt" })
        if (!userId) {
            return res.status(400).send({ status: false, message: "Book userId is required" });
        }
        if (!ISBN) {
            return res.status(400).send({ status: false, message: "Book ISBN is required" });
        }
        if (!isValidISBN(ISBN)) return res.status(400).send({ status: false, message: "Please provide valid ISBN " })

        if (!category) {
            return res.status(400).send({ status: false, message: "Book category is required" });
        }
        if (!isValid(category)) return res.status(400).send({ status: false, message: "Please provide valid category " })
        if (!subcategory) {
            return res.status(400).send({ status: false, message: "Book subcategory is required" });
        }
        if (!isValid(subcategory)) return res.status(400).send({ status: false, message: "Please provide valid subcategory " })
        if (!reviews) {
            return res.status(400).send({ status: false, message: "Book reviews is required" });
        }
        if (!releasedAt) {
            return res.status(400).send({ status: false, message: "Book releasedAt is required" });
        }
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/
        if (!isValid(releasedAt) || !dateFormat.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "enter valid releasedAt" })
        }
        const uniqueBook = await bookModel.findOne({ title: title });
        if (uniqueBook) {
            return res.status(400).send({ status: false, message: "book is already with this title" })
        }

        const uniqueISBN = await bookModel.findOne({ ISBN: ISBN });
        if (uniqueISBN) {
            return res.status(400).send({ status: false, message: "ISBN of book should be unique" })
        }
        const userID = await userModel.findById(userId);
        if (!userID) {
            return res.status(400).send({ status: false, message: "userId is not valid" })
        }
        Object.keys(req.body).includes("userId")
        if (req.body.userId != req.decodedToken) {
            return res.status(403).send({ status: false, message: "User logged in is not allowed to create the requested user's book" });
        }

        const bookDetail = await bookModel.create(book);
        res.status(201).send({ status: true, data: bookDetail });

    } catch (err) {
        res.status(500).send({ staus: false, message: err.message })
    }
}
const getBookByQuery = async function (req, res) {
    try {
        const filter = req.query
        const { userId, category, subcategory, ISBN } = filter
        if (ISBN) {
            return res.status(400).send({ status: false, message: "enter valid query" })
        }
        filter.isDeleted = false
        const bookData = await bookModel.find(filter).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })

        if (bookData.length === 0) {
            return res.status(404).send({ status: false, message: "No book found with the filter" })
        }
        return res.status(200).send({ status: true, message: 'Books list', data: bookData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const getBooks = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,message:"book ID is not a valid ObjectID"})
        }
        const bookData = await bookModel.find({ _id: bookId }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
        if (bookData.length == 0) return res.status(404).send({ status: false, message: "book data not found" })
        // If the book has no reviews then the response body should include book detail as shown [here](#book-details-response-no-reviews) and an empty array for reviewsData.
        let review = await reviewModel.find({ bookId: bookId, isDeleted: false })
    //    console.log(bookData)
        // let {__v,...books}=bookData._doc
        bookData.reviewData = review
        return res.status(200).send({ status: true, message: "Books list", data: bookData})

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const updateBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const data = req.body
        const { title, excerpt, releasedAt, ISBN } = data
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,message:"book ID is not a valid ObjectID"})
        }
        if (!isValidRequestBody(data))
            return res.status(400).send({ status: false, message: "Please provide data for creating book" });
            // const bookData = await bookModel.findById(bookId)
        if(title){
        if (!isValid(title)) return res.status(400).send({ status: false, message: "Please provide valid title" })

        let uniqueTitle = await bookModel.findOne({ title: title })//unique title
        if (uniqueTitle) return res.status(400).send({ status: false, message: "A book is already created with this title"})
        }
        if (!isValid(excerpt)) return res.status(400).send({ status: false, message: "Please provide valid excerpt" })
        if(ISBN){
        let registeredISBN = await bookModel.findOne({ ISBN: ISBN }) //unique ISBN
        if (registeredISBN) return res.status(400).send({status: false, message: "A book is already created with this ISBN"})
        }
       if(releasedAt){
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/
        if (!isValid(releasedAt) || !dateFormat.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "enter valid releasedAT" })}
       }
        let book= await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!book) return res.status(404).send({status: false,message: "There is no book with this id"})
        
        const updateData = await bookModel.findOneAndUpdate({ _id: bookId }, data, { new: true })
        return res.status(200).send({ status: true, message: "Updated data", data: updateData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
const deleteBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId
        if(!isValidObjectId(bookId)){
            return res.status(400).send({status:false,message:"book ID is not a valid ObjectID"})
        }
        // const bookData = await bookModel.findById(bookId)
        let book= await bookModel.findOne({_id:bookId,isDeleted:false})
        if(!book) return res.status(404).send({status: false,message: "There is no book with this id"})
        await bookModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: new Date()}, { new: true })

        return res.status(200).send({ status: true, message: "book has been deleted successfully" })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { createBook, getBooks, getBookByQuery, updateBookById, deleteBookById }