const express = require('express');
const { Pool, Client } = require('pg');
const bodyParser = require('body-parser');
//const uuidv4 = require('uuid/v4');
const passport=require('passport');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const morgan=require('morgan');
require('dotenv').config();
const app = express();

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser());
app.use(morgan('dev'));
require('./lib/routes.js');
app.set('superSecret','stackFlowSecret');

const port = process.env.PORT;
const pool = new Pool({
	user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT,
});

const v1 = express.Router();


  

v1.use(bodyParser());
v1.route('/auth/login')
	.post((req, res)=>{
		const pass=req.body.password;
		const username=req.body.username;
		let query = `SELECT * FROM "tblUser" WHERE username='${username}'`;
		pool.query(query,(err,result)=>{
			bcrypt.compare(pass,result.rows[0].password).then((ans)=>{
				if (ans){
					const payload={
						user:username
					};
					//let token=jwt.sign(payload,app.get('superSecret'),{expiresIn:'ih'});
					let token=jwt.sign(payload, app.get('superSecret'), { expiresIn: '24h' });
					
					res.json({
						success: true,
						message: 'Enjoy your token!',
						token: token
					});
				} 
				else {
					res.send('failure');
				}
			});
			
		});
		
	});
v1.route('/auth/signup')
	.post((req, res)=>{
		const pass=req.body.password;
		const username=req.body.username;
		let query = `SELECT username FROM "tblUser" WHERE username='${username}'`;
		pool.query(query, (err, result) => {
			if (result.rows[0]) {
				res.send('username not available');
			}
			else {
				bcrypt.hash(pass, 5, (err, hash)=> {
					let query = `INSERT INTO "tblUser"(username, password, "userEmail", "userRole")
						VALUES ('${username}', '${hash}', '${username}', 'user');`;
					pool.query(query, (err, res) => {
						pool.end();
					});
				});
				res.send('user added');
			}
		});
	}); 

v1.use(function(req, res, next) {
	// check header or url parameters or post parameters for token
	let token = req.body.token || req.query.token || req.headers['x-access-token'];
	// decode token
	if (token) {
		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'),(err, decoded)=> {      
			if (err) {
				//console.log(err);
				return res.json({ success: false, message: 'Failed to authenticate token.' });    
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;   
				console.log(decoded.user);
				next();
			}
		}); 
	} else {
		// if there is no token
		// return an error
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.' 
		});
	}
});
v1.route('/questions')
	.get((req, res)=>{
		let query = 'SELECT * FROM "tblquestion"';
		pool.query(query, (err, result) => {
			res.json(result.rows);
		});
		//console.log('Getting call from question get ',req);
		
	})
	.post((req, res)=>{
		const question=req.body.question;
		const username=req.decoded.user;
		let query = `INSERT INTO tblquestion(
			question, rating, answered, "datePosted", username)
			VALUES ('${question}', 0, false, NOW(), '${username}') RETURNING "questionId";`;
		pool.query(query,(err, result)=>{
			//console.log(result.rows[0].questionId);
			res.json({success:true,
				questionId: result.rows[0].questionId
			});
		});
		
		
	});
v1.route('/questions/:id')
	.get((req, res)=>{
		let query = `SELECT * FROM "tblquestion" 
					WHERE "questionId"= ${req.params.id}`;
		pool.query(query, (err, result) => {
			res.json(result.rows);
			
		});
	})
	.delete((req,res)=>{
		//console.log('Getting call from questionId delete  ',req.body);
		res.send('questionId Delete');
	});
v1.route('/questions/:id/answers')
	.post((req,res)=>{
		//console.log('Getting call from questionId delete  ',req.body);
		res.send('/questions/:id/answers post');
	});
v1.route('/questions/:id/answers:id')
	.post((req,res)=>{
		//console.log('Getting call from questionId delete  ',req.body);
		res.send('/questions/:id/answers:id post');
	});


app.use('/v1', v1);
app.use('/', v1); // Set the default version to v1.



app.listen(port, function () {
	console.log('Server Started, Listening on Port ', port);
    
}); 

