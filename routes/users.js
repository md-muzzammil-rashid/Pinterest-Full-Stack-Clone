var express = require('express');
var router = express.Router();

const plm = require('passport-local-mongoose')
const mongoose = require('mongoose');
const { stringify } = require('uuid');

mongoose.connect('mongodb://localhost:27017/Pinterest')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
    unique:false
  },
  password: {
    type: String,
  },
  posts: {
    type: Array,
    default:[],
    ref:'Post'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  email:{
    type:String,
  },
  avatar:{
    type:String,
    default: 'default-avatar.jpg'
  },
  description:{
    type:String,
  },
  saved:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Post'
  }]
  }
)

userSchema.plugin(plm)

module.exports = mongoose.model("Users", userSchema)
