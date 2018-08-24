const express = require('express');
const app = express();
const passport = require('passport');

//const request = require('request');
const { Pool, Client } = require('pg')
const bcrypt = require('bcrypt');
const uuidv4 = require('uuidv4');
const LocalStrategy = require('passport-local').Strategy;
const pool = new Pool({
	user: process.env.PGUSER,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	password: process.env.PGPASSWORD,
	port: process.env.PGPORT,
	ssl: true
});