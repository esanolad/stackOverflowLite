const request=require('request');
const serve=require('../server.js');
require('dotenv').config();
const port = process.env.PORT;
const base_url = `http://localhost:8000/v1/`;
describe('server',()=>{
	describe ('POST /auth/login',()=>{
		it('returns status code 200', (done)=>{
			request.post(base_url+'auth/login', (err, res, body)=>{
				expect(res.statusCode).toBe(200);
				done();
			});
		});
        /*
		it('returns body of success or failure', (done)=>{
			request.post(base_url+'auth/login', (err, res, body)=>{
				expect(body).toBe('{"success":false,"reason":"username or password incorrect"}');
				done();
			});
		});*/
	});
	describe ('POST /auth/signup',()=>{
		it('returns status code 200', (done)=>{
			request.post(base_url+'auth/signup', (err, res, body)=>{
				expect(res.statusCode).toBe(200);
				done();
			});
		});
        /*
		it('returns status code 200', (done)=>{
			request.post(base_url+'auth/signup', (err, res, body)=>{
				expect(body).toBe('');
				done();
			});
		}); */
	});
    /*
	describe ('GET /questions',()=>{
		it('returns status code 200', (done)=>{
			request.post(base_url+'questions', (err, res, body)=>{
				expect(res.statusCode).toBe(200);
				done();
			});
		});
		it('returns status code 200', (done)=>{
			request.post(base_url+'questions', (err, res, body)=>{
				expect(body).toBe('');
				done();
			});
		});
	});
	describe ('POST /questions',()=>{
		it('returns status code 200', (done)=>{
			request.get(base_url+'questions', (err, res, body)=>{
				expect(res.statusCode).toBe(200);
				done();
			});
		});
		it('returns status code 200', (done)=>{
			request.get(base_url+'questions', (err, res, body)=>{
				expect(body).toBe('');
				done();
			});
		});
	});
    
	describe ('GET /questions/:id',()=>{
		it('returns status code 200', (done)=>{
			request.get(base_url+'questions/1', (err, res, body)=>{
				expect(res.statusCode).toBe(200);
				done();
			});
		});
		it('returns status code 200', (done)=>{
			request.get(base_url+'questions/1', (err, res, body)=>{
				expect(body).toBe('');
				done();
			});
		});
	});
	
	describe ('DELETE /questions/:id',()=>{
		it('returns status code 200', (done)=>{
			request.delete(base_url+'questions/1', (err, res, body)=>{
				expect(res.statusCode).toBe(200);
				done();
			});
		});
		it('returns status code 200', (done)=>{
			request.delete(base_url+'questions/1', (err, res, body)=>{
				expect(body).toBe('');
				done();
			});
		});
	});
    
	describe ('PUT /questions/:id/answers/:ansId',()=>{
		it('returns status code 200', (done)=>{
			request.put(base_url+'questions/1/answers/1', (err, res, body)=>{
				expect(res.statusCode).toBe(200);
				done();
			});
		});
		it('returns status code 200', (done)=>{
			request.put(base_url+'questions/1/answers/1', (err, res, body)=>{
				expect(body).toBe('');
				done();
			});
		});
	});
    
	describe ('GET /questionAnswers/:id',()=>{
		it('returns status code 200', (done)=>{
			request.put(base_url+'questionAnswers/1', (err, res, body)=>{
				expect(res.statusCode).toBe(200);
				done();
			});
		});
		it('returns status code 200', (done)=>{
			request.put(base_url+'questionAnswers/1', (err, res, body)=>{
				expect(body).toBe('');
				done();
			});
		});
	}); */
});