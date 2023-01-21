const mongoose = require("mongoose");

const Post = new mongoose.Schema(
  {
    title: String,
    body: String,
    created_by: String,
    status: {
        type: String,
        default: "active"
    },
    geo_location: {
        type: { type: String },
        coordinates: []
    }
  },
  { timestamps: true }
);

Post.index({geo_location: "2dsphere"})

module.exports = mongoose.model("Post", Post);
