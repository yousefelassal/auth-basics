const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const config = require("./utils/config");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

const mongoDb = config.MONGODB_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
  })
);

const app = express();
app.set("views", __dirname);
app.set("view engine", "ejs");

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try{
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: "Invalid username" });
            }
            if (user.password !== password) {
                return done(null, false, { message: "Incorrect password" });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => res.render("index", { user: req.user }));
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", [
    body("username").trim().isLength({ min: 1 }).escape().withMessage("Username must be specified."),
    body("password").trim().isLength({ min: 1 }).escape().withMessage("Password must be specified."),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        if (!errors.isEmpty()) {
            res.render("sign-up-form", { user: user, errors: errors.array() });
            return;
        } else {
            await user.save();
            res.redirect("/");
        }
    })
]);

app.post(
    "/log-in",
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/"
    })
)

app.get("/log-out", (req, res, next) => {
    req.logout(function(err){
        if(err){return next(err);}
        res.redirect("/");
    })
})

app.listen(3000, () => console.log("app listening on port 3000!"));