const express = require('express');
const { Pool, Client } = require('pg');
const bodyParser = require('body-parser');
const uuidv4 = require('uuid/v4');
const passport=require('passport');
const bcrypt=require('bcrypt')
require('dotenv').config();
const app = express();

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser());
require('./lib/routes.js');
//const pp= process.env.PORT;
//console.log(pp);
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
		//console.log('Getting call from post ',req.body);
		res.send('login post');
	});
v1.route('/auth/signup')
	.post((req, res)=>{
		const pass=req.body.password;
		const username=req.body.username;
		let query = `SELECT username FROM "tblUser" WHERE username='${username}'`;
		pool.query(query, (err, result) => {

			if (result.rows[0]) {
				console.log(result.rows[0]);
				res.send('username not available');
			}
			else {
				
				bcrypt.hash(pass, 5, (err, hash)=> {
					let query = `INSERT INTO "tblUser"(username, password, "userEmail", "userRole")
						VALUES ('${username}', '${hash}', '${username}', 'user');`;
					pool.query(query, (err, res) => {
						//console.log(err, res);
						pool.end();
					});
				});
				res.send('user added');
			}
			
			//pool.end();
		});
		
		
	}); 
v1.route('/questions')
	.get((req, res)=>{
		console.log('Getting call from question get ',req.body);
		res.send('question get');
	})
	.post((req, res)=>{
		console.log('Getting call from question post ',req.body);
		res.send('question post');
	});
v1.route('/questions/:id')
	.get((req, res)=>{
		console.log('Getting call from questionId get ',req.body);
		res.send('questionId get');
	})
	.delete((req,res)=>{
		console.log('Getting call from questionId delete  ',req.body);
		res.send('questionId Delete');
	});
v1.route('/questions/:id/answers')
	.post((req,res)=>{
        console.log('Getting call from questionId delete  ',req.body);
		res.send('/questions/:id/answers post');
	});
v1.route('/questions/:id/answers:id')
	.post((req,res)=>{
        console.log('Getting call from questionId delete  ',req.body);
		res.send('/questions/:id/answers:id post');
	});


app.use('/v1', v1);
app.use('/', v1); // Set the default version to v1.



app.listen(port, function () {
	console.log('Server Started, Listening on Port ', port);
    
}); 


function checkUsername(username){
	let query = `SELECT username from "tblUser" WHERE username='${username}'`;
	//console.log(pool);
	pool.query(query, (err, res) => {
		//console.log(err, res);
		//pool.end();
		if (res) {
			console.log('returning true');
			return true; 
		}
		else {console.log('returning false'); return false;}
		
		//pool.end();
	});
}