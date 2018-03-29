let express = require('express');
let router = express.Router();

// Get Index View
router.get('/', function(req, res){
    res.render('index');
});

module.exports = router;