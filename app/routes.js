const ObjectId = require("mongodb").ObjectId;
module.exports = function (app, passport, db, multer, ObjectId) {
  // Image Upload Code =========================================================================
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images/uploads");
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "-" + Date.now() + ".png");
    },
  });
  var upload = multer({ storage: storage });

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get("/", function (req, res) {
    res.render("home.ejs");
  });

  // PROFILE SECTION =========================
  app.get("/profile", isLoggedIn, function (req, res) {
    db.collection("posts")
      .find({ postedBy: req.user._id })
      .toArray((err, result) => {
        if (err) return console.log(err);
        db.collection("users")
        .findOne({_id: ObjectId(req.user._id)},(err, users) => {
         console.log(users.local.role)
          if(users.local.role === 'student'){
            res.render("profile.ejs", {
              user: req.user,
              posts: result,
            });
          }else{
            res.render("mentorprofile.ejs", {
              user: req.user,
              posts: result,
            });
             }
             ;
          
        
      });
  });
});
  // edit page 
  app.get("/edit", isLoggedIn, function (req, res) {
    db.collection("users")
      .find({ _id : req.user._id })
      .toArray((err, result) => {
        console.log(result)
        if (err) return console.log(err);
        res.render("edit.ejs", {
          user: result,
          // posts: result,
        });
      });
  });
  
  //feed page
  app.get("/feed.ejs", function (req, res) {
    db.collection("posts")
      .find()
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("feed.ejs", {
          posts: result,
        });
      });
  });

  app.get("/post/comments/:zebra", isLoggedIn, function (req, res) {
    let postId = ObjectId(req.params.zebra);
    console.log(postId);
    db.collection("posts")
      .find({ _id: postId })
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("post.ejs", {
          posts: result,
        });
      });
  });
// find poster
  //profile page
  app.get("/page/:id", isLoggedIn, function (req, res) {
    let postId = ObjectId(req.params.id);
    db.collection("posts")
      .find({ postedBy: postId })
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("page.ejs", {
          posts: result,
        });
      });
  });

  app.get("/search/:text", isLoggedIn, function (req, res) {
    db.collection("posts")
      .find({ $text: { $search: req.params.text } })
      .toArray((err, result) => {
        if (err) return console.log(err);
        res.render("page.ejs", {
          posts: result,
        });
      });
  });
  // LOGOUT ==============================
  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });

  // post routes // nested call back 
  app.post("/makePost", upload.single("file-to-upload"), (req, res) => {
    let image 
    if(req?.file?.filename === ""){
     image = ""
    } else{
      image = "images/uploads/" + req?.file?.filename}
      db.collection("posts").save(
        {
          caption: req.body.caption,
          img: image ,
          postedBy: req.user._id,
          posterrole: req.user.local.role,
          like: 0,
          comment: [],
        },
        (saveerr, result) => {
          if (saveerr) return console.log(saveerr);
          console.log("saved to database");
          res.redirect("/profile");
        }
      );
  
   
  });
// s
  app.post('/upDateProfile',upload.single("profilePic"),(req, res) => {
    let user = req.user._id;
    console.log('test',req.body)
    console.log(req.file)
    db.collection('users').findOneAndUpdate({_id: ObjectId(req.user._id)}, {$set:{name:req.body.name, 
      profilePic: "images/uploads/" + req.file.filename,
      cityState: req.body.cityState,
      jobTitle: req.body.jobTitle, 
      role: req.body.role ,
       }},
        {
      sort: { _id: -1 },
      upsert: true,
    },
    (err, result) => {
      console.log(result);
      if (err) return console.log(err)
      res.redirect('/edit')
      
    });
  });

  // message board routes ===============================================================

  app.put("/likes", (req, res) => {
    const _id = req.body._id;
    db.collection("posts").findOneAndUpdate(
      { _id: ObjectId(_id) },
      {
        $inc: {
          like: 1,
        },
      },
      {
        sort: { _id: -1 },
        upsert: true,
      },
      (err, result) => {
        if (err) return res.send(err);
        res.send(result);
      }
    );
  });

  app.put("/post/comments/likes", (req, res) => {
    const _id = req.body._id;
    db.collection("posts").findOneAndUpdate(
      { _id: ObjectId(_id) },
      {
        $inc: {
          like: 1,
        },
      },
      {
        sort: { _id: -1 },
        upsert: true,
      },
      (err, result) => {
        if (err) return res.send(err);
        res.send(result);
      }
    );
  });

  app.post("/post/comments/submit", (req, res) => {
    let user = req.user;
    let time = new Date().toLocaleString();
    const postId = ObjectId(req.body.postId);

    const newTestObject = {
      commentBy: user.local.email,
      comment: req.body.comment,
      likes: 0,
      liked: false,
      time,
      postId: postId,
    };

    console.log(`POSTID = ${postId}`);

    db.collection("posts").findOneAndUpdate(
      { _id: postId },
      {
        $push: {
          comment: newTestObject,
        },
      },
      {
        sort: { _id: -1 },
        upsert: true,
      },
      (err, result) => {
        if (err) return console.log(err);
        res.redirect("/feed");
      }
    );
  });

  app.delete("/messages", (req, res) => {
    db.collection("posts").findOneAndDelete(
      {_id:ObjectId(req.body.postId)},
      (err, result) => {
        if (err) return res.send(500, err);
        res.send("Message deleted!");
      }
    );
  });
// mentor stuff 

app.get("/mentorfeed", function (req, res) {
    
  db.collection("posts")
    .find()
    .toArray((err, result) => {
      if (err) return console.log(err);
      res.render("feed1.ejs", {
        posts: result,
      });
    });
});
  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get("/login", function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  app.get("/mentorlogin", function (req, res) {
    res.render("mentorlogin.ejs", { message: req.flash("loginMessage") });

  });

  // process the login form
  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/feed", // redirect to the secure profile section
      failureRedirect: "/login", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );
  app.post(
    "/mentorlogin",
    passport.authenticate("local-login", {
      successRedirect: "/mentorfeed", // redirect to the secure profile section
      failureRedirect: "/mentorlogin", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );
  // SIGNUP =================================
  // show the signup form
  app.get("/signup", function (req, res) {
    res.render("signup.ejs", { message: req.flash("signupMessage") });
  });
  app.get("/mentorsignup", function (req, res) {
    res.render("mentorsignup.ejs", { message: req.flash("signupMessage") });
  });
  // process the signup form
  app.post(
    "/signup",
    passport.authenticate("local-signup", {
      successRedirect: "/profile", // redirect to the secure profile section
      failureRedirect: "/signup", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );
  app.post(
    "/mentorsignup",
    passport.authenticate("local-signup", {
      successRedirect: "/mentorfeed", // redirect to the secure profile section
      failureRedirect: "/mentorsignup", // redirect back to the signup page if there is an error
      failureFlash: true, // allow flash messages
    })
  );
  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get("/unlink/local", isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect("/profile");
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.redirect("/");
}
