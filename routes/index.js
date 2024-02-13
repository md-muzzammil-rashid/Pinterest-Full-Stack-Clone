var express = require('express');
var router = express.Router();

const localStrategy = require('passport-local')
const userModel = require('./users')
const postModel = require('./posts')
const passport = require('passport');
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req,res){
  res.render('register')
})

router.post('/register', function(req, res){
  let userdata = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    secret: 'mitochondria is the powerhosue of the cell',
    email:req.body.email
    
  })
  userModel.register(userdata, req.body.password)
  .then(function (registereduser){
    passport.authenticate("local")(req, res , function(){
      res.redirect('/profile')
    })
  })
})

router.post('/login', passport.authenticate("local", {
  successRedirect: '/profile',
  failureRedirect:'/login'
}), function(req, res){})

router.get('/profile/', isLoggedIn , async function(req, res){
  const user =await userModel.findOne({username: req.session.passport.user})
  .populate('posts')
  res.render('profile',{user:user})
})
router.get('/profile/saved', isLoggedIn , async function(req, res){
  const user =await userModel.findOne({username: req.session.passport.user})
  .populate('saved')
  console.log(user.saved)
  res.render('partials/saved',{user:user})
})

router.get('/logout', function(req, res, next){
  req.logout(function(err){
    if(err){
      return next(err)
    }
    res.redirect('/')
  })
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return (next())
  }
  res.redirect("/")
}

router.get("/addpost", isLoggedIn, function(req, res){
  res.render('addpost')
})

router.post('/addpost', upload.single('postimage'), async function(req, res){
  if(!req.file){
    return res.send('something went wrong')
  }
    const user = await userModel.findOne({username: req.session.passport.user})
    const uploadedpost =await postModel.create({
    title: req.body.title,
    description: req.body.description,
    author: user._id,
    tags: req.body.tags.split(',').map(item=>item.trim()),
    postimage: req.file.filename,
    comments: []
  })
  user.posts.push(uploadedpost._id)
  await user.save()
  res.redirect('/profile')
})

router.get('/explore',async (req, res)=>{
  const post = await postModel.find()
                     .populate('author')
  res.render('explore', {post:post})
})

router.get('/pin/:pinid',async function(req,res){
  const pinId = req.params.pinid;
  const user = await userModel.findOne({username: req.session.passport.user })
  const pinpost = await postModel.findById(pinId)
          .populate({
            path: 'comments',
            populate: {
              path: 'author',
              model: 'Users',
            },
          })
          .populate('author')
  res.render('pin', {pinpost:pinpost, user:user?user:''})
})

router.post(('/pin/:pinid/addcomment'),async (req, res)=>{
  const pinId = req.params.pinid;
  const comment = req.body.comment;
  const user = await userModel.findOne({username: req.session.passport.user})
  const authorId =  user._id
  const commented = await postModel.findById(pinId);
  commented.comments.push({
    commenttext:comment,
    author: authorId
  })
  await commented.save().then(res.redirect(`/pin/${pinId}`))
})

router.get('/editprofile', async function(req, res){
  const user = await userModel.findOne({username: req.session.passport.user})
  res.render('editprofile',{user:user})
})

router.post("/updateavatar", upload.single('updatedavatar'),async (req, res)=>{
  if(!req.file){
    return res.red('something went wrong')
  }
  await userModel.findOneAndUpdate({username: req.session.passport.user},{avatar:req.file.filename})
  
  res.redirect('/editprofile')
})

router.post('/updateprofile',async(req, res)=>{
  const user = await userModel.findOne({username: req.session.passport.user})
  if(req.body.editpassword !==''){
    user.setPassword(req.body.editpassword, async ()=>{
     await user.save()

    })
  }
  await userModel.findByIdAndUpdate(user._id,{
    username: req.body.editusername,
    fullname: req.body.editfullname,
    description: req.body.editdesc
  })
  res.redirect('/profile')
})

router.post('/save',async function (req,res){
  const user = await userModel.findOne({username: req.session.passport.user, saved: req.body.savepinid} )
  if(user){
    await userModel.findOneAndUpdate({_id:user._id},{$pull: {saved:req.body.savepinid}})
    res.redirect(req.get('referer'))
  }else{
    const ifUserWithSamePinNotExist = await userModel.findOne({username: req.session.passport.user})
    ifUserWithSamePinNotExist.saved.push(req.body.savepinid)
    await ifUserWithSamePinNotExist.save()
    res.redirect(req.get('referer'))
  }

})

module.exports = router;
