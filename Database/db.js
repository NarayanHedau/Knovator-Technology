const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/knovator")
  .then(() => {
    console.log("Database Connect Successfully");
  })
  .catch((err) => {
    console.log("Unable to Connect Database",);
  });
