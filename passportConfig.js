const LocalStrategy = require('passport-local').Strategy;
const {pool} = require('./dbConfig');
const bcrypt = require('bcrypt');

function initialize (passport) {
    const authenticateUser = (email,password,done) => {
      pool.query('SELECT * FROM users WHERE email = $1',[email], (err,results) => {
        if(err) {
            throw err;
        }

        console.log(results);

        //code to run if the email is registered 
        if(results.rows.length > 0) {
            const user = results.rows[0];
            
            bcrypt.compare(password,user.password,(err,isMatch) => {
            //code to run if there's a programming error when comparing the passwords
             if (err) {
                return done (err);
             }

             //code to run if the passwords match
             if(isMatch) {
                return done(null,user);
             }
            //code to run if the passwords do not match 
              else {
                return done(null,false,{message: 'Password is incorrect'});
             }});
        } 
        //code to run if the email is not registered 
        else {
            return done(null,false,{mmessage : 'Email is not registered'});
        }
      })
    }

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    authenticateUser
));

//to store the user's id during the session
passport.serializeUser((user,done) => {
    done(null,user.id);  
});

//using the id from .serializeUser to retrieve the users data from the database, it will then be available in req.user
passport.deserializeUser((id,done) => {
    pool.query('SELECT * FROM users WHERE id = $1',[id], (err,results) => {
        if(err) {
            console.log(error)
        }
        return done(null,results.rows[0]);
    });
})

}

module.exports = initialize;