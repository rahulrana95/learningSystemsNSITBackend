// Basic Setup
var http     = require('http');
var express  = require('express');
var 	mysql    = require('mysql');
var 	parser   = require('body-parser');
 var reload = require('reload');
var bcrypt = require('bcrypt');
var app=express();

// Database Connection
var connection = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'pritam',
  database : 'lms'
});

 
 
// Setup express
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));
app.set('port', process.env.PORT || 5000);

 
// Set default route
app.get('/', function (req, res) {
	res.send('<html><body><p>Welcome to PRO Learning System</p></body></html>');
});

app.get('/product/:id', function (req,res) {
	var id = req.params.id;
 
	connection.query('SELECT * from nd_products where id = ?', [id], function(err, rows, fields) {
  		if (!err){
  			var response = [];
 
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});

app.post('/product/add', function (req,res) {
	var response = [];
 
	if (
		typeof req.body.name !== 'undefined' && 
		typeof req.body.price !== 'undefined' && 
		typeof req.body.imageUrl !== 'undefined'
	) {
		var name = req.body.name, price = req.body.price, imageUrl = req.body.imageUrl;
 
		connection.query('INSERT INTO nd_products (product_name, product_price, product_image) VALUES (?, ?, ?)', 
			[name, price, imageUrl], 
			function(err, result) {
		  		if (!err){
 
					if (result.affectedRows != 0) {
						response.push({'result' : 'success'});
					} else {
						response.push({'msg' : 'No Result Found'});
					}
 
					res.setHeader('Content-Type', 'application/json');
			    	res.status(200).send(JSON.stringify(response));
		  		} else {
				    res.status(400).send(err);
			  	}
			});
 
	} else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
    	res.status(200).send(JSON.stringify(response));
	}
});

app.post('/product/edit/:id', function (req,res) {
	var id = req.params.id, response = [];
 
	if (
		typeof req.body.name !== 'undefined' && 
		typeof req.body.price !== 'undefined' && 
		typeof req.body.imageUrl !== 'undefined'
	) {
		var name = req.body.name, price = req.body.price, imageUrl = req.body.imageUrl;
 
		connection.query('UPDATE nd_products SET product_name = ?, product_price = ?, product_image = ? WHERE id = ?', 
			[name, price, imageUrl, id], 
			function(err, result) {
		  		if (!err){
 
					if (result.affectedRows != 0) {
						response.push({'result' : 'success'});
					} else {
						response.push({'msg' : 'No Result Found'});
					}
 
					res.setHeader('Content-Type', 'application/json');
			    	res.status(200).send(JSON.stringify(response));
		  		} else {
				    res.status(400).send(err);
			  	}
			});
 
	} else {
		response.push({'result' : 'error', 'msg' : 'Please fill required information'});
		res.setHeader('Content-Type', 'application/json');
    	res.send(200, JSON.stringify(response));
	}
});

app.delete('/product/delete/:id', function (req,res) {
	var id = req.params.id;
 
	connection.query('DELETE FROM nd_products WHERE id = ?', [id], function(err, result) {
  		if (!err){
  			var response = [];
 
			if (result.affectedRows != 0) {
				response.push({'result' : 'success'});
			} else {
				response.push({'msg' : 'No Result Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});
 
// Create server


	app.post('/login',function(req,res){
	console.log(req.body);
    var userName = req.body.username;
    var password = req.body.password;
	console.log(userName);
	console.log(password);
    var q= `SELECT uid,name,password,type,COUNT(uid) AS num FROM login WHERE name = '${userName}'`;
    connection.query(q, function(err, result) {
      if (err) {
        console.log(err);
        res.json({
          "status" : "404",
          "error" : err
        });
      }
      else {
		  console.log(result);
        bcrypt.compare(password,result[0].password ,function(err,check) {
          if (err || result[0].num < 1) {
            res.json({
              "status" : "200",
              "verifyStatus" : false
            });
          }
          else if(check){
			  if(result[0].type==1){
			  connection.query('SELECT * from teacher where uid = ?', result[0].uid, function(err, rows, fields) {
			if (!err){
  			var response = [];
			response.push({'result':'success','type':result[0].type});
 
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
					}
			else {
		    res.status(400).send(err);
			}
			});
		  }
		  else if(result[0].type ==2){
			  connection.query('SELECT * from student where uid = ?', result[0].uid, function(err, rows, fields) {
			if (!err){
  			var response = [];
			response.push({'result':'success','type':result[0].type});
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
					}
			else {
		    res.status(400).send(err);
			}
			});
		  }
          }
          });
        }
    });
});

	app.post('/signup', function(req,res) {
    var userName = req.body['username'];
    var password = req.body['password'];
	var type=req.body['type'];
    var user = req.body['user'];
    if (userName === undefined || password === undefined || userName.length <= 0 || password.length <= 0) {
      res.json({
        "status" : "404",
        "error" : "Invalid username or password"
      });
      return;
    }
    var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
          var q= `INSERT INTO login VALUES ('','${userName}','${hash}','${type}');`;
          connection.query(q,function(err,result) {
              if (err) {
                console.log(err);
                res.json({
                  "status" : "404",
                  "error" : err
                });
              }
              else {
                res.json({
                  "status" : "200",
                  "result" : result
                });
              }
          });
      });
    });
});

app.post('/add_discuss', function (req,res) {
	var response = [];
 
	if (
		typeof req.body.uid !== 'undefined' && 
		typeof req.body.subject !== 'undefined' &&
		typeof req.body.semester !== 'undefined' &&
		typeof req.body.branch !== 'undefined' &&
		typeof req.body.query !== 'undefined'
	) {
		var uid = req.body.uid, subject = req.body.subject, semester = req.body.semester,branch = req.body.branch,query = req.body.query;
 
		connection.query('INSERT INTO discuss (uid,subject,semester,branch,query) VALUES (?, ?, ?, ? , ?)', 
			[uid, subject, semester,branch,query], 
			function(err, result) {
		  		if (!err){
 
					if (result.affectedRows != 0) {
						response.push({'result' : 'success'});
					} else {
						response.push({'msg' : 'No Result Found'});
					}
 
					res.setHeader('Content-Type', 'application/json');
			    	res.status(200).send(JSON.stringify(response));
		  		} else {
				    res.status(400).send(err);
			  	}
			});
 
	} else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
    	res.status(200).send(JSON.stringify(response));
	}
});



app.post('/add_comments', function (req,res) {
	var response = [];
 
	if (
		typeof req.body.did !== 'undefined' && 
		typeof req.body.uid !== 'undefined' && 
		typeof req.body.comments !== 'undefined'
	) {
		var did = req.body.did, uid = req.body.uid, comments = req.body.comments;
		var timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
 
		connection.query('INSERT INTO discuss_comments (did, uid,timestamp, comments) VALUES (?, ?, ?, ?)', 
			[did, uid,timestamp, comments], 
			function(err, result) {
		  		if (!err){
 
					if (result.affectedRows != 0) {
						response.push({'result' : 'success'});
					} else {
						response.push({'msg' : 'No Result Found'});
					}
 
					res.setHeader('Content-Type', 'application/json');
			    	res.status(200).send(JSON.stringify(response));
		  		} else {
				    res.status(400).send(err);
			  	}
			});
 
	} else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
    	res.status(200).send(JSON.stringify(response));
	}
});

app.post('/add_resources', function (req,res) {
	var response = [];
 
	if (
		typeof req.body.uid !== 'undefined' && 
		typeof req.body.semester !== 'undefined' && 
		typeof req.body.branch !== 'undefined' &&
		typeof req.body.link !== 'undefined'
	) {
		var uid = req.body.uid, semester = req.body.semester, branch = req.body.branch,link=req.body.link;
 
		connection.query('INSERT INTO resources (uid, semester, branch,link) VALUES (? ,?, ?, ?)', 
			[uid, semester,branch,link], 
			function(err, result) {
		  		if (!err){
 
					if (result.affectedRows != 0) {
						response.push({'result' : 'success'});
					} else {
						response.push({'msg' : 'No Result Found'});
					}
 
					res.setHeader('Content-Type', 'application/json');
			    	res.status(200).send(JSON.stringify(response));
		  		} else {
				    res.status(400).send(err);
			  	}
			});
 
	} else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
    	res.status(200).send(JSON.stringify(response));
	}
});

app.post('/add_announcements', function (req,res) {
	var response = [];
 
	if (
		typeof req.body.uid !== 'undefined' && 
	    typeof req.body.semester !== 'undefined' &&
		typeof req.body.branch !== 'undefined' && 
		typeof req.body.content !== 'undefined'
	) {
		var uid = req.body.uid,semester=req.body.semester,branch=req.body.branch, content = req.body.content;
 
		connection.query('INSERT INTO announcements (uid, semester,branch,content) VALUES (?, ?,?,?)', 
			[uid,semester,branch, content], 
			function(err, result) {
		  		if (!err){
 
					if (result.affectedRows != 0) {
						response.push({'result' : 'success'});
					} else {
						response.push({'msg' : 'No Result Found'});
					}
 
					res.setHeader('Content-Type', 'application/json');
			    	res.status(200).send(JSON.stringify(response));
		  		} else {
				    res.status(400).send(err);
			  	}
			});
 
	} else {
		response.push({'result' : 'error', 'msg' : 'Please fill required details'});
		res.setHeader('Content-Type', 'application/json');
    	res.status(200).send(JSON.stringify(response));
	}
});

app.get('/view_announcement', function (req,res) {
	
 
	connection.query('SELECT * from announcements ', function(err, rows, fields) {
  		if (!err){
  			var response = [];
 
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});


app.get('/view_discuss', function (req,res) {
	
	connection.query('SELECT * from discuss ', function(err, rows, fields) {
  		if (!err){
  			var response = [];
 
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});

app.get('/view_resources/:semester/:branch', function (req,res) {
	
		var semester=req.params.semester,branch=req.params.branch;
 
	connection.query('SELECT * from resources where semester= ? and branch=?', [semester,branch], function(err, rows, fields) {
  		if (!err){
  			var response = [];
 
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});

app.get('/view_comments/:did', function (req,res) {
	
		var did=req.params.did;
 
	connection.query('SELECT * from discuss_comments where did=? order by timestamp', [did], function(err, rows, fields) {
  		if (!err){
  			var response = [];
 
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});

app.get('/my_discuss/:uid', function (req,res) {
	var uid = req.params.uid;
 
	connection.query('SELECT * from discuss where uid = ?', [uid], function(err, rows, fields) {
  		if (!err){
  			var response = [];
 
			if (rows.length != 0) {
				response.push({'result' : 'success', 'data' : rows});
			} else {
				response.push({'result' : 'error', 'msg' : 'No Results Found'});
			}
 
			res.setHeader('Content-Type', 'application/json');
	    	res.status(200).send(JSON.stringify(response));
  		} else {
		    res.status(400).send(err);
	  	}
	});
});



/*var nodemailer = require('nodemailer');

var router = express.Router();
app.use('/sayHello', router);
router.post('/', handleSayHello); // handle the route at yourdomain.com/sayHello

function handleSayHello(req, res) {
    // Not the movie transporter!
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'prirocks42@gmail.com', // Your email id
            pass: 'D127shakarpur!' // Your password
        }
    });
}


var mailOptions = {
    from: 'example@gmail.com>', // sender address
    to: 'receiver@destination.com', // list of receivers
    subject: 'Email Example', // Subject line
    text: text //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.json({yo: 'error'});
    }else{
        console.log('Message sent: ' + info.response);
        res.json({yo: info.response});
    };
});*/



http.createServer(app).listen(app.get('port'), function(){
	console.log('Server listening on port ' + app.get('port'));
});