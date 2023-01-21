const mongoose = require("mongoose");
const express = require("express");
let jwt = require("jsonwebtoken");
let response = require("./helper/response")
require("./Database/db");
require("./model/user/user.model");
require("./model/post/post.model")
const User = mongoose.model("User");
const Post = mongoose.model("Post")
const bcrypt = require("bcrypt");
const passport = require("passport")
const { validationResult } = require('express-validator');
const validator = require("./helper/validator")
let saltRounds = 10;
const app = express();
app.use(express.json());

app.use(passport.initialize());
require("./helper/passport")

const secrete = 'secret'

app.post("/register", validator.registration(), async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userData = await User.findOne({
      $or: [{ email: req.body.email },
      { mobile: req.body.mobile },]
    })
    if (userData) {
      response.errorMsgResponse(res, 201, "User already registerd")
    } else {
      let data = req.body;
      bcrypt.genSalt(saltRounds, async function (err, salt) {
        bcrypt.hash(data.password, salt, async function (err, hash) {
          data["password"] = hash;
          var user = await new User(data).save();
          if (user) {
            response.successResponse(res, 201, "User registerd successfully", user)
          } else {
            response.errorMsgResponse(res, 301, "Something went wrong")
          }
        })
      });
    }
  } catch (error) {
    console.log(error)
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})


app.post("/login", validator.login(), async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, mobile, password } = req.body;
    let findUser = await User.findOne({
      $or: [{ email: email }, { mobile: mobile }],
    });

    if (!findUser) {
      response.errorMsgResponse(res, 400, "email or mobile number not found")
    } else {
      findUser = JSON.parse(JSON.stringify(findUser));
      let matchPasword = await bcrypt.compare(password, findUser.password);
      if (matchPasword) {
        let token = await jwt.sign(findUser, secrete, {
          expiresIn: "24h",
        });
        findUser["token"] = `Bearer ${token}`;
        response.successResponse(res, 200, "User login successfully", findUser)
      } else {
        response.errorMsgResponse(res, 400, "email or password is incorrect")
      }
    }
  } catch (error) {
    console.log(error);
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
});

app.get("/profile", passport.authenticate('jwt', { session: false }), async (req, res) => {
  res.send(req.user)
});

app.post("/post", passport.authenticate('jwt', { session: false }), validator.postValidator(), async (req, res) => {
  try {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, body, geo_location } = req.body;
    const obj = {
      title, body, geo_location, created_by: req.user.email
    }
    const post = new Post(obj);

    const result = await post.save()

    response.successResponse(res, 200, "Post is successfully created.", result)
  } catch (error) {
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
});

app.post("/post/geo_location", passport.authenticate('jwt', { session: false }), validator.postByGeoLocation(), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { long, lat } = req.body;
    const result = await Post.find({
      geo_location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [long, lat]
          },
          $maxDistance: 10000,
          $minDistance: 0
        }
      }
    })

    response.successResponse(res, 200, "Post is successfully created.", result)
  } catch (error) {
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
});

app.get("/dashboard", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const result = await Post.aggregate([
      {
        $group: {
          _id: "$status",
          data: { $push: "$$ROOT" },
        }
      }
    ]);
    let obj = {};
    for (item of result) {
      obj[item._id] = item.data.length
    }
    response.successResponse(res, 200, "Post is successfully created.", obj)
  } catch (error) {
    console.log("Log", error)
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.get("/getAll", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let result = await Post.find();
    response.successResponse(res, 200, "fetched post successfully.", result)

  } catch (error) {
    response.errorMsgResponse(res, 301, "Something went wrong")
  }
})

app.put("/update/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let result = await Post.findOneAndUpdate({ _id: req.params.id }, { $set: req.body });
    if (!result) {
      return response.errorMsgResponse(res, 301, "Something went wrong")
    }
    result = await Post.findById(req.params.id)
    response.successResponse(res, 200, "Update post successfully.", result)
  } catch (error) {
    response.errorMsgResponse(res, 301, "Something went wrong")

  }
})

app.delete("/delete/:id", passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    let result = await Post.findOneAndDelete({ _id: req.params.id });
    response.successResponse(res, 200, "Post deleted successfully.")

  } catch (error) {
    response.errorMsgResponse(res, 301, "Something went wrong")

  }
})
app.listen(8000, () => {
  console.log("Port is Connected on 8000");
});
