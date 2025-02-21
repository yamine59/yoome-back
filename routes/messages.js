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

router.get('/listMessage/:id', (req, res) =>{

    const id  = req.params.id;

    console.log(id);
    
    
    const sql = 'SELECT * FROM messages WHERE id_channel = ? ORDER BY created_at;';
    db.query(sql, [id], (err, results) =>{
        if(err){
            return res.status(500).send(err);
        }
        else{
            res.status(200).json(results); 
        }
    })
})



router.post('/addMessage', (req, res) =>{



    const { message, hour, id_channel, id_user } = req.body;
    

    const sql = 'INSERT INTO messages (message, created_at, id_channel, id_user) VALUE (?,?,?,?)';
    db.query(sql, [message, hour, id_channel, id_user], (err, results) =>{
        if(err){
            return res.status(500).send(err);
        }
        else{
            res.status(200).json(results); 
        }
    })

})





module.exports = router;