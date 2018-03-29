let express = require('express');
let router = express.Router();




// Get Register View
router.get('/register', function(req, res){
    res.render('register');
});

// Get Login View
router.get('/login', function(req, res){
    res.render('login');
});


module.exports = router;