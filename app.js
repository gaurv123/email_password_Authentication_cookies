require('dotenv').config();
const express=require('express');
const ejs=require('ejs');
const bodyParser=require('body-parser');
const mongoose=require("mongoose");
const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');


const app=express();
app.set("view engine","ejs");

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended:false}));

// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery',true);
mongoose.connect(process.env.URL);


const userSchema=new mongoose.Schema({
    username:String,
    password:String,

});
userSchema.plugin(passportLocalMongoose);




const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/",function(req,res){
    res.render("home");
}); 

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/cart",function(req,res){
    console.log(req.isAuthenticated());
    if(req.isAuthenticated()){
        res.render("cart");
    }
    else{
        res.redirect("/login");
    }
});

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
app.post("/register",function(request,response){
    User.register({username:request.body.username},request.body.password,function(err,user){
        if(err){
            console.log(err);
            response.redirect("/register");
        }
        else{
            passport.authenticate("local")(request,response,function(){
                response.redirect("/cart");
            });
        }
    })
});

app.post("/login",function(request,response){
    const newUser=new User({
        username:request.body.username,
        password:request.body.password
    })
    request.login(newUser,function(err){
        if(err){
            console.log(err);

        }
        else{
            passport.authenticate("local")(request,response,function(){
                response.redirect("/cart");
            })
        }
    })

})


app.listen(3000,function(){
    console.log("Server running on port 3000");
});