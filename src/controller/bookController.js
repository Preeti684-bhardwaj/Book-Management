const bookModel = require('../model/bookModel');
const userModel = require('../model/userModel');
const validator = require('../utils/validator');

const createBook = async function (req, res) {
    try {
        const book = req.body;
        const { title, excerpt, userId, ISBN, category, subcategory, reviews, releasedAt } = book
        if (!title) {
            return res.status(400).send({ status: false, message: "Book title is required" });
        }
        if (!excerpt) {
            return res.status(400).send({ status: false, message: "Book excerpt is required" });
        }
        if (!userId) {
            return res.status(400).send({ status: false, message: "Book userId is required" });
        }
        if (!ISBN) {
            return res.status(400).send({ status: false, message: "Book ISBN is required" });
        }
        if (!category) {
            return res.status(400).send({ status: false, message: "Book category is required" });
        }
        if (!subcategory) {
            return res.status(400).send({ status: false, message: "Book subcategory is required" });
        }
        if (!reviews) {
            return res.status(400).send({ status: false, message: "Book reviews is required" });
        }
        if (!releasedAt) {
            return res.status(400).send({ status: false, message: "Book releasedAt is required" });
        }
        const userID = await userModel.findById({ userId: userId });
        if (!userID) {
            return res.status(400).send({ status: false, message: "userId is not valid" })
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
        const {userId,category,subcategory}=filter
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

const getBooks = async function (res, req) {
    try {
        const bookId = req.params.bookId
        const bookData = await blogModel.find(bookId).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        if (bookData.length == 0) return res.status(404).send({ status: false, message: "book data not found" })
// If the book has no reviews then the response body should include book detail as shown [here](#book-details-response-no-reviews) and an empty array for reviewsData.
        return res.status(200).send({ status: true, message: "Books list", data: bookData })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}



const updateBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const data = req.body
        const { title, excerpt, releasedAt, ISBN } = data
        // const bookData = await bookModel.findById(bookId)

        const updateData = await bookModel.findOneAndUpdate({ _id: bookId }, data, { new: true })

        return res.status(200).send({ status: true, message: "Updated data", data: updateData })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
const deleteBookById = async function (req, res) {
    try {
        const bookId = req.params.bookId
        // const bookData = await bookModel.findById(bookId)

        await bookModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: new Date() }, { new: true })

        return res.status(200).send({ status: true, message: "The has been deleted successfully" })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}



module.exports = { createBook, getBooks, getBookByQuery, updateBookById, deleteBookById }