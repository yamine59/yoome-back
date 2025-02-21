require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const date = require('./../services/frenchDate');
const dateLikes = require('./../services/checkLikeAvailable');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    token: process.env.TOKEN_SECRET
})

//--------------------- CRUD channels (create, read, update, delete)

//delete
router.post('/eraseChannel/:channel', (req, res) => {

    const nameChannel = req.params.channel
    
    const sql = 'DELETE FROM channels WHERE name_channel = ?';

    db.query(sql, [nameChannel], (err,result) =>{
        if(err){
            return res.status(500).send(err)
        }
        else{
            res.status(201).json({
                message: 'La discussion a bien été supprimée'
            })
        }

    })
})

//read
router.get('/listChannel/:id', (req, res) =>{
/*
ID de l'utilisateur pour fetch les canaux de discussions appartenant à l'utilisateur
*/
    idUser = req.params.id

    const sql = 'SELECT * FROM channels WHERE id_user1 = ? OR id_user2 = ?';
    db.query(sql, [idUser, idUser], (err, results) =>{
        if(err){
            return res.status(500).send(err);
        }
        else{
            res.status(200).json(results); 
        }
    })
})






module.exports = router;