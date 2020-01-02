var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // Get userName;
    // let userName = window.localStorage.getItem('client_name') || null;
    res.render('home', { title: 'Bai Bai Bai', page: 'home-page' });
});

/* GET home page. */
router.get('/tien-len', function(req, res, next) {
    // If not have user name show homepage
    res.render('tienlen', { title: 'Tiến lên miền nam', page:'game-page' });
});

module.exports = router;
