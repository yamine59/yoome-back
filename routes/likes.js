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

//--------------------- CRUD profils (create, read, update, delete)

//create
router.post('/addLikes', async (req,res) => {
    
    const addDate = await date();
    const {
       id_user_liker,
       id_user_liked
    } = req.body;

    const checkIfLiked = await checkAlreadyLiked(id_user_liker, id_user_liked);
    const canLike = await checkCanLike(id_user_liker);

    console.log("checkifliked", checkIfLiked, "canlike", canLike);
    
    if(!checkIfLiked){
        return res.status(201).send({message: "impossible de liker de nouveau cette personne"})
    }
    else if(!canLike){
        return res.status(201).send({message: "Vous ne pouvez plus liker, pensez à devenir premium pour bénéficier de tous les avantages"})
    }
    else{
        const sql =' INSERT INTO likes (id_user_liker, id_user_liked, created_at) VALUE (?,?,?)';
        db.query(sql,[id_user_liker, id_user_liked, addDate], async (err,result) =>{
            if (err) {
                return res.status(500).send(err);
            }
            await createChannel(id_user_liker, id_user_liked)

            res.status(201).send({message: 'like envoyé'})
        })
    }
})

function checkAlreadyLiked(id_user_liker, id_user_liked){

    //const sql = 'SELECT id_like FROM `likes` WHERE id_user_liker = ? AND id_user_liked = ?;';
    const sql = 'SELECT COUNT(*) AS count FROM likes WHERE id_user_liker = ? AND id_user_liked = ?;';
    return new Promise((resolve, reject) => {
        db.query(sql, [id_user_liker, id_user_liked], (err, result) => {
            console.log("res", result);
            
            if (err) {
                return res.status(500).send(err)
            } else {
                if (result.length === 0 || result[0].id_like === 0) {
                    resolve(true); 
                } else {
                    resolve(!false); 
                }
            }
        });
    })
}

function checkCanLike(idUser){

    const dateLikeOfDay = dateLikes()

    const sql = 'SELECT COUNT(created_at) AS count FROM likes WHERE DATE(created_at) = ? AND id_user_liker = ?;';
    return new Promise((resolve, reject) => {
        db.query(sql, [dateLikeOfDay, idUser], (err, result) => {
           
            if (err) {
                return res.status(500).send(err)
            }
            else{
                const numberLike = result[0].count;
                if (numberLike < 11) {
                    resolve(true); 
                } else {
                    resolve(false); 
                }
            }
        });
    })
}

function createChannel(id_user_liker, id_user_liked){

    const sql = 'SELECT (SELECT COUNT(*) FROM likes WHERE id_user_liker = ? AND id_user_liked = ?) + (SELECT COUNT(*) FROM likes WHERE id_user_liker = ? AND id_user_liked = ?) AS total_likes;'
        db.query(sql, [id_user_liker, id_user_liked, id_user_liker, id_user_liked], (err, result) => {
            console.log('nomalement 2', result[0].total_likes);
                       
            if (err) {
                return res.status(500).send(err)
            }
            else if(result[0].total_likes < 2){
                return
            }
            else if(result[0].total_likes === 2){
                const randomNumber = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;

                const sql =' INSERT INTO channels (name_channel, id_user1, id_user2) VALUE (?,?,?) ';
                db.query(sql,[randomNumber, id_user_liker, id_user_liked], (err,result) =>{
                    if (err) {
                        return res.status(500).send(err);
                    }
                    
                })
            }
        })
}


module.exports = router;