var express = require('express');
const userModel = require('./users');
const postModel = require('./post')
const passport = require('passport');
var router = express.Router();
const localStrategy = require('passport-local')
const upload = require('./multer');
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res, next) {
  res.render('index', { nav: false });
});

router.get('/register', function (req, res, next) {
  res.render('register', { nav: false });
});

router.get('/add', function (req, res, next) {
  res.render('add', { nav: true });
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.
    findOne({ username: req.session.passport.user })
    .populate('posts');
  console.log(user)
  res.render('profile', { user, nav: true });
});

router.get('/show/post', isLoggedIn, async function (req, res, next) {
  const user = await userModel.
    findOne({ username: req.session.passport.user })
    .populate('posts');
  console.log(user)
  res.render('show', { user, nav: true });
});

router.get('/feed', isLoggedIn, async function (req, res, next) {
  const posts = await postModel.find()
    .populate("user")
  res.render('feed', { posts, nav: true })
});

router.get('/show/post/:postid', isLoggedIn, async function (req, res, next) {
  // const user = await userModel.
  //   findOne({ username: req.session.passport.user })
  //   .populate('posts')
  const posts = await postModel.find()
    .populate("user")
  let matchingPost;
  posts.forEach(element => {

    if (element._id.toString() === req.params.postid) {
      matchingPost = element
    }
  });
  console.log(matchingPost)
  res.render('showpostdata', { matchingPost, nav: true });
});

router.post('/createpost', isLoggedIn, upload.single('postimage'), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename
  })
  user.posts.push(post._id);
  user.save();
  res.redirect('/profile')
})

router.post('/fileupload', isLoggedIn, upload.single('image'), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect('/profile')
});

router.post('/register', function (req, res, next) {
  const data = new userModel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact
  })

  userModel.register(data, req.body.password)
    .then(function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile')
      })
    })
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/',
  successRedirect: '/profile'
}))

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/')
}

module.exports = router;
