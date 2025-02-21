require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const date = require('../services/frenchDate');
const dateLikes = require('../services/checkLikeAvailable');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    token: process.env.TOKEN_SECRET
})

router.get('/listMatch/:id', (req, res) =>{

    const idUser = req.params.id

    // const sql = 'SELECT u.firstname, p.selfie, c.id_channel, c.id_user1, c.id_user2 FROM users AS u INNER JOIN profiles AS p ON u.id_user = p.id_user INNER JOIN channels AS c ON u.id_user = c.id_user1 OR u.id_user = c.id_user2 WHERE u.id_user <> (?);';
    const sql = 'SELECT DISTINCT c.id_channel, u.firstname, c.id_user1, c.id_user2, p.selfie FROM channels AS c INNER JOIN users AS u ON (u.id_user = c.id_user1 OR u.id_user = c.id_user2) INNER JOIN profiles AS p ON u.id_user = p.id_user WHERE (c.id_user1 = ? OR c.id_user2 = ?) AND u.id_user <> ?;'
    db.query(sql, [idUser, idUser, idUser], (err, results) =>{
        if(err){
            return res.status(500).send(err);
        }
        else{
            res.status(200).json(results); 
        };
    });
});

router.get('/match', (req, res) =>{

    const idUser = req.query.idUser
    const id = req.query.id

    console.log(idUser, id);
    
    
    const sql = 'SELECT u.firstname, u.birthdate, p.selfie, c.id_channel, c.id_user1, c.id_user2 FROM users AS u INNER JOIN profiles AS p ON u.id_user = p.id_user INNER JOIN channels AS c ON u.id_user = c.id_user1 OR u.id_user = c.id_user2 WHERE u.id_user <> ? AND id_channel = ?; ';
    db.query(sql, [idUser, id], (err, results) =>{
        if(err){
            return res.status(500).send(err);
        }
        else{
            res.status(200).json(results); 
        };
    });
});





module.exports = router;