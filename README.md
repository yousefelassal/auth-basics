# Authentication Basics

## [Local Strategy](http://www.passportjs.org/concepts/authentication/password/)

```js
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
```

## Securing Passwords

```js
bcrypt.hash("somePassword", 10, async (err, hashedPassword) => {
  // if err, do something
  // otherwise, store hashedPassword in DB
});
```

```js
const match = await bcrypt.compare(password, user.password);
if (!match) {
  // passwords do not match!
  return done(null, false, { message: "Incorrect password" })
}
```
