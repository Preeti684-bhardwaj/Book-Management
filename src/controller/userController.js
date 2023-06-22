const userModel = require('../model/userModel');
const {isValid, isValidRequestBody, isValidEmail,isValidtitle ,isValidMobileNum}= require('../utils/validator');
const jwt=require('jsonwebtoken')
const dotenv =require('dotenv').config()
const {SECRET_KEY}=process.env;

const createUser = async function (req, res) {
  try {
    const userData = req.body;
    const { title, name, phone, email, password, address } = userData;

    //validations
    if (!isValidRequestBody(userData)) {
      return res.status(400).send({ status: false, message: "No data is present in body" });
    }
    if (!title) {
      return res.status(400).send({ status: false, message: "user title is required" });
    }
    if(!isValidtitle(title)) return res.status(400).send({ status: false,message: "Please provide valid title for the user" });
    if (!isValid(title)) {
      return res.status(400).send({ status: false, message: "Enter a valid title" });
    }

    // { name: {mandatory}
    if (!name) {
      return res.status(400).send({ status: false, message: "user name is required" });
    }
    if (!isValid(name)) {
      return res.status(400).send({ status: false, message: "Enter a valid password" });
    }

    // mobile: {mandatory, valid mobile number, unique},
    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "phone number is required" });
    }

    if (!isValid(phone) || !isValidMobileNum(phone)) {
      return res.status(400).send({ status: false, message: "enter valid phoneNumber" });
    }

    const isPhone = await userModel.findOne({ phone: phone });
    if (isPhone) {
      return res.status(400).send({ status: false, message: "phone no. is already registered" });
    }
    // email: {mandatory, valid email, unique},
    if (!email) {
      return res.status(400).send({ status: false, message: "Email is required" });
    }

    if (!isValid(email) || !isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "Enter a valid email" });
    }

    const isEmail = await userModel.findOne({ email: email });
    if (isEmail) {
      return res.status(400).send({ status: false, message: "Email address is already registered" });
    }
    if (!password) {
      return res.status(400).send({ status: false, message: "password is required" });
    }
    if (!validator.isValid(password)) {
      return res.status(400).send({ status: false, message: "Enter a valid password" });
    }
    if (!validator.isValid(address)) {
      return res.status(400).send({ status: false, message: "Enter a valid address" });
    }

    const createUserData = await userModel.create(userData);
    res.status(201).send({ status: true, data: createUserData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}


const userLogin = async function (req, res) {
  try {
    if (!isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, message: "No data is present in body" });
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ status: false, message: "Please enter email and password" });
    }

    if (!isValid(email) || !isValidEmail(email)) {
      return res.status(400).send({ status: false, message: "Enter a valid email" });
    }

    if (!isValid(password)) {
      return res.status(400).send({ status: false, message: "Enter a valid password" });
    }

    const userDetail = await userModel.findOne({ email: email, password: password });
    if (!userDetail) {
      return res.status(401).send({ status: false, message: "username or the password is not correct" })
    }

    //generate token

    if (userDetail) {
      const token = jwt.sign({ userId: userDetail._id, exp: 7560606060 }, SECRET_KEY)

      return res.status(200).send({ status: true, data: { token: token } })
    } else {
      return res.status(401).send({ status: false, message: "not a authenticate user" })
    }

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


module.exports = { createUser, userLogin  }