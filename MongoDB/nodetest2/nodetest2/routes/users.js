var express = require('express');
var router = express.Router();

/* GET userlist. */
router.get('/userlist', function(req, res) {
  var db = req.db;
  var collection = db.get('client');
  console.log(collection[0])
  collection.find({},{},function(e,docs){
    res.json(docs);
  });
});

/* POST to adduser. */
router.post('/adduser', function(req, res) {
  var db = req.db;
  var collection = db.get('client');
  collection.insert(req.body, function(err, result){
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );
  });
});


/* DELETE to deleteuser. */
router.delete('/deleteuser/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('client');
  var userToDelete = req.params.id;
  collection.remove({ '_id' : userToDelete }, function(err) {
    res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
  });
});

module.exports = router;
