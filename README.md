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
