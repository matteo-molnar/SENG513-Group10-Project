let express = require('express');
let router = express.Router();

// Get Index View
router.get('/', function(req, res){
    if (req.user) {
        res.render('index', {username: req.user.username});
    } else {
        res.render('index', {username: null});
    }
});

module.exports = router;
