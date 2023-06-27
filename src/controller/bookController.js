const bookModel = require("../model/bookModel");
const userModel = require("../model/userModel");
const reviewModel = require("../model/reviewModel");
const {
  isValid,
  isValidRating,
  isValidISBN,
  isValidRequestBody,
  isValidEmail,
  isValidMobileNum,
  isValidObjectId,
  isValidtitle,
} = require("../utils/validator");

const createBook = async function (req, res) {
  try {
    const bookData = req.body;

    const {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      reviews,
      releasedAt,
    } = bookData;

    if (!isValidRequestBody(bookData)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter data in body" });
    }

    // title: {string, mandatory, unique},

    if (!title) {
      return res
        .status(400)
        .send({ status: false, message: "title is required" });
    }

    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "enter valid title" });
    }

    const istitle = await bookModel.findOne({ title: title });
    if (istitle) {
      return res
        .status(400)
        .send({ status: false, message: "title is already present" });
    }

    //  excerpt: {type : String,trim : true, required : true}
    if (!excerpt) {
      return res
        .status(400)
        .send({ status: false, message: "excerpt is required" });
    }
    if (!isValid(excerpt)) {
      return res
        .status(400)
        .send({ status: false, message: "enter valid excerpt" });
    }

    //     userId: {ObjectId, mandatory, refs to user model},
    if (!userId) {
      return res
        .status(400)
        .send({ status: false, message: "userId is required" });
    }
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "userId is not valid ObjectId" });
    }

    //     ISBN: {string, mandatory, unique},
    if (!ISBN) {
      return res
        .status(400)
        .send({ status: false, message: "ISBN is required" });
    }

    if (!isValid(ISBN)) {
      return res
        .status(400)
        .send({ status: false, message: "enter valid ISBN" });
    }

    const isISBN = await bookModel.findOne({ ISBN: ISBN });
    if (isISBN) {
      return res
        .status(400)
        .send({ status: false, message: "ISBN is already present" });
    }

    //     category: {string, mandatory},
    if (!category) {
      return res
        .status(400)
        .send({ status: false, message: "category is required" });
    }

    if (!isValid(category)) {
      return res
        .status(400)
        .send({ status: false, message: "enter valid category" });
    }

    //     subcategory: {string, mandatory},
    if (!subcategory) {
      return res
        .status(400)
        .send({ status: false, message: "subcategory is required" });
    }

    if (!isValid(subcategory)) {
      return res
        .status(400)
        .send({ status: false, message: "enter valid subcategory" });
    }

    //     releasedAt: {Date, mandatory, format("YYYY-MM-DD")},
    if (!releasedAt) {
      return res
        .status(400)
        .send({ status: false, message: "releasedAt is required" });
    }
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!isValid(releasedAt) || !dateFormat.test(releasedAt)) {
      return res
        .status(400)
        .send({ status: false, message: "enter valid release date" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .send({ status: false, message: "User is not found" });
    }
    const createBook = await bookModel.create(bookData);

    const { __v, ...book } = createBook._doc;

    return res.status(201).send({ status: true, data: book });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
const getBookByQuery = async function (req, res) {
  try {
    const filter = req.query;
    const { userId, category, subcategory, ISBN } = filter;

    filter.isDeleted = false;
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: "userId is not valid ObjectId" });
    }

    const bookData = await bookModel
      .find(filter)
      .select({
        _id: 1,
        title: 1,
        excerpt: 1,
        userId: 1,
        category: 1,
        releasedAt: 1,
        reviews: 1,
      })
      .sort({ title: 1 });

    if (bookData.length === 0) {
      return res
        .status(404)
        .send({ status: false, message: "No book found with the filter" });
    }
    return res
      .status(200)
      .send({ status: true, message: "Books list", data: bookData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const getBooks = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    if (!isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "book ID is not a valid ObjectID" });
    }
    const bookData = await bookModel.findOne({ _id: bookId ,isDeleted: false}).select({
      _id: 1,
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      releasedAt: 1,
      reviews: 1,
    });
    if(!bookData) return res.status(404).send({
            status: false,
            message: 'bookId not exit'
        })
    
    // If the book has no reviews then the response body should include book detail as shown [here](#book-details-response-no-reviews) and an empty array for reviewsData.
    let review = await reviewModel.find({ bookId: bookId, isDeleted: false });
    //    console.log(bookData)
    // let {__v,...books}=bookData._doc
    bookData.reviewData = review;
    return res
      .status(200)
      .send({ status: true, message: "Books list", data: bookData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateBookById = async function (req, res) {
  try {
    const bookId = req.params.bookId;

    const data = req.body;
    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        message: "Please provide data for creating book",
      });
    }
    const { title, excerpt, releasedAt, ISBN } = data;

    // const bookData = await bookModel.findById(bookId)

    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid title" });
    }
    let uniqueTitle = await bookModel.findOne({ title: title }); //unique title
    if (uniqueTitle) {
      return res.status(400).send({
        status: false,
        message: "A book is already created with this title",
      });
    }
    if (!isValid(excerpt))
      return res
        .status(400)
        .send({ status: false, message: "Please provide valid excerpt" });

    let registeredISBN = await bookModel.findOne({ ISBN: ISBN }); //unique ISBN
    if (registeredISBN) {
      return res.status(400).send({
        status: false,
        message: "A book is already created with this ISBN",
      });
    }

    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!isValid(releasedAt) || !dateFormat.test(releasedAt)) {
      return res
        .status(400)
        .send({ status: false, message: "enter valid releasedAT" });
    }
    let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!book) {
      return res
        .status(404)
        .send({ status: false, message: "Book is already deleted" });
    }

    const updateData = await bookModel.findOneAndUpdate({ _id: bookId }, data, {
      new: true,
    });
    return res
      .status(200)
      .send({ status: true, message: "Updated data", data: updateData });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};
const deleteBookById = async function (req, res) {
  try {
    const bookId = req.params.bookId;
    if (!isValidObjectId(bookId)) {
      return res
        .status(400)
        .send({ status: false, message: "book ID is not a valid ObjectID" });
    }

    // const bookData = await bookModel.findById(bookId)
    let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!book)
      return res
        .status(404)
        .send({ status: false, message: "There is no book with this id" });
    await bookModel.findOneAndUpdate(
      { _id: bookId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    return res
      .status(200)
      .send({ status: true, message: "book has been deleted successfully" });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createBook,
  getBooks,
  getBookByQuery,
  updateBookById,
  deleteBookById,
};
