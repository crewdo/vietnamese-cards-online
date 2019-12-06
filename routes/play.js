const express = require("express");
const router = express.Router();


router.route("/").get((req, res) => {
    var rs = {user: "Crew"};
    res.send(rs);
});

module.exports = router;
