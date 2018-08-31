const express = require('express');
const { Pool} = require('pg');
const bodyParser = require('body-parser');
//const uuidv4 = require('uuid/v4');
const passport=require('passport');
const bcrypt=require('bcrypt-nodejs');
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
			if (err){
				res.json({success:false, reason: err});
			} else if (result.rows[0]){
				bcrypt.compare(pass,result.rows[0].password,(ans)=>{
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
						res.json({success:false, reason: 'username or password incorrect'});
						//console.log(res);
					}
				});
			} else{
				res.json({success:false, reason: 'username or password incorrect'});
				//console.log(res);
			}

			
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
				bcrypt.hash(pass, 5, null, (err, hash)=> {
					let query = `INSERT INTO "tblUser"(username, password, "userEmail", "userRole")
						VALUES ('${username}', '${hash}', '${username}', 'user') RETURNING "usesrname";`;
					pool.query(query, (err, result) => {
						if (err){
							res.json({success:false, reason:err});
						}
						if (result){
							res.json({success:true, result:result});
						}
						pool.end();
					});
				});
				//res.send('user added');
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
				//console.log(decoded.user);
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
		
	})
	.post((req, res)=>{
		const question=req.body.question;
		const username=req.decoded.user;
		let query = `INSERT INTO tblquestion(
			question, rating, answered, "datePosted", username)
			VALUES ('${question}', 0, false, NOW(), '${username}') RETURNING "questionId";`;
		pool.query(query,(err, result)=>{
			//console.log(result.rows[0].questionId);
			if (err) {
				res.json({success:false, reason: err});
			} 
			if (result) {
				res.json({success:true,
					questionId: result.rows[0].questionId
				});
			} 
			
		});
		
		
	});
v1.route('/questions/:id')
	//selects question by ID
	.get((req, res)=>{
		let query = `SELECT * FROM "tblquestion" 
					WHERE "questionId"= ${req.params.id}`;
		pool.query(query, (err, result) => {
			if (err) {
				res.json({success:false, reason: err});
			} 
			if (result) {
				res.json({success:true, result:result.rows});
			}
			
		});
	})
	.delete((req,res)=>{
		//Deletes question by ID
		let query = `DELETE FROM "tblquestion" 
					WHERE "questionId"= ${req.params.id} RETURNING "questionId"`;
		pool.query(query, (err, result) => {
			if (err) {
				res.json({success:false, reason: err});
			} 
			if (result.rows[0]) {
				res.json({success:true, result:result.rows[0]});
			} else {
				res.json({success:false, reason: 'Question ID not found'});
			}
		});
		
	});
v1.route('/questions/:id/answers')
	.post((req,res)=>{
		//posts an answer to a question
		const ans=req.body.answer;
		const username=req.decoded.user;
		let query=`INSERT INTO "tblAnswer"(
			"questionId", "datePosted", answer, preferred, username)
			VALUES (${req.params.id}, NOW(),'${ans}' ,false, '${username}') 
			RETURNING "answerId";`;
		pool.query(query, (err, result) => {
			if (err) {
				res.json({success:false, reason: err});
			} else
			if (result.rows[0]) {
				res.json({success:true, result:result.rows[0]});
			} else {
				res.json({success:false, reason: 'err'});
			}
		});
	});
v1.route('/questions/:id/answers/:ansId')
//Mark an answer as accepted or update an answer.
	.put((req,res)=>{
		const answerId=req.params.ansId;
		//console.log(req.params);
		let query=`UPDATE "tblAnswer"
			SET preferred=true
			WHERE "answerId"= ${answerId} RETURNING "answerId";`;
		pool.query(query, (err, result) => {
			if (err) {
				res.json({success:false, reason: err});
			} 
			if (result) {
				res.json({success:true, result:result.rows});
			}
		});
		//console.log('Getting call from questionId delete  ',req.body);
		//res.send('/questions/:id/answers:id post');
	});

v1.route('/questionAnswers/:id')
	//selects all answers of a question ID
	.get((req, res)=>{
		let query = `SELECT * FROM "tblAnswer" 
					WHERE "questionId"= ${req.params.id}`;
		pool.query(query, (err, result) => {
			if (err) {
				res.json({success:false, reason: err});
			} 
			if (result) {
				res.json({success:true, result:result.rows});
			}
			
		});
	});

app.use('/v1', v1);
app.use('/', v1); // Set the default version to v1.

exports.closeServer=function(){
	serve.close();
};

const serve=app.listen(port, function () {
	//console.log('Server Started, Listening on Port ', port);
    
}); 

