const model = require('../models/user');
const Event = require('../models/event');
const Rsvp = require('../models/rsvp');
const { validationResult } = require('express-validator');

//user navigation

exports.new = (req, res)=>{
    
    return res.render('./user/new');

};

exports.create = (req, res, next)=>{

//implementing validationResult
let errors = validationResult(req);
if(!errors.isEmpty()) {
    errors.array().forEach(error=>{
        req.flash('error', error.msg);
    });
    return res.redirect('back');
}

//implementing flash messages 
let user = new model(req.body);
if(user.email) {
    user.email = user.email.toLowerCase();
}
user.save()
.then(user=> {
    req.flash('success', 'You have successfully registered');
    res.redirect('/users/login');
})
.catch(err=>{
    if(err.name === 'ValidationError' ) {
        req.flash('error', err.message); 
        //res.redirect('back'); here instead ? 
        return res.redirect('/users/new');
    }

    if(err.code === 11000) {
        req.flash('error', 'Email has been used'); 
        //res.redirect('back'); here instead ?  
        return res.redirect('/users/new');
    }
    
    next(err);
}); 


};

exports.getUserLogin = (req, res, next) => {

    return res.render('./user/login');

}

exports.login = (req, res, next)=>{

    let email = req.body.email;
    if(email) {
        email = email.toLowerCase();
    }
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('wrong email address');
            req.flash('error', 'wrong email address');  
            res.redirect('/users/login');
            } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.name = user.firstName;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/users/profile');
            } else {
                req.flash('error', 'wrong password');      
                res.redirect('/users/login');
            }
            });     
        }     
    })
    .catch(err => next(err));


};

exports.profile = (req, res, next)=>{
let id = req.session.user;
// Promise.all([model.findById(id), Event.find({author: id})])
Promise.all([
    Event.find({ author: req.session.user }),
    Rsvp.find({ user: req.session.user }).populate('event')
])

.then(results=>{
    const [ events, rsvps] = results;
    console.log(rsvps);
    res.render('./user/profile', { events, rsvps});
})
.catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
req.session.destroy(err=>{
    if(err) 
       return next(err);
   else
        res.redirect('/');  
});

};