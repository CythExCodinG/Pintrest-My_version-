const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://Admin:rohitpintrest@admin.fetmeom.mongodb.net/?retryWrites=true&w=majority&appName=Admin")
//It offers using serializeuser and deserializeuser
const plm = require('passport-local-mongoose')


const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: []
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }
  ]

})

userSchema.plugin(plm)

module.exports = mongoose.model('user', userSchema)
