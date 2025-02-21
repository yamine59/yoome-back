require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const date = require('./../services/frenchDate')

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    token: process.env.TOKEN_SECRET
})

//--------------------- CRUD profils (create, read, update, delete)

//create
router.post('/createPersonalization', (req,res) => {

    //const idUser = req.params.idProfil

    const {
        hobby,
        type_relationship,
        personality,
        smoke,
        languages,
        idUser,
    } = req.body;

    const sql =' INSERT INTO personalizations (hobby, type_relationship, personality, smoke, languages, id_user ) VALUE (?,?,?,?,?,?)';
    db.query(sql,[hobby, type_relationship, personality, smoke, languages, idUser], (err,result) =>{
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({message: 'personnalisation du profil créé'})
    })
})


//modify Profil (without created_at, id_user and premium)
router.post('/modifyPersonalization/:id', (req,res) => {

    const idUser = req.params.id

    const {
        hobby,
        type_relationship,
        personality,
        smoke,
        languages,
    } = req.body;

    const sql ='UPDATE personalizations SET hobby = ?, type_relationship = ?, personality = ?, smoke = ?, languages = ? WHERE id_user = ?';
    db.query(sql,[hobby, type_relationship, personality, smoke, languages, idUser], (err,result) =>{
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send({message: 'personnalisation du profil modifié'})
    })
})

//delete personalization 
router.post('/erasePersonalisation/:id', (req, res) => {

    const idUser = req.params.id
    
    const sql = 'DELETE FROM personalizations WHERE id_user = ?';

    db.query(sql, [idUser], (err,result) =>{
        if(err){
            return res.status(500).send(err)
        }
        else{
            res.status(201).json({
                message: 'personnalisation de l\'utilisateur effacée'
            })
        }

    })
})

// read Personalization
router.get('/showPersonalization/:id', (req, res) => {

    const idUser = req.params.id
    
    const sql = 'SELECT * FROM personalizations WHERE id_user = ?';

    db.query(sql, [idUser], (err,results) =>{
        if(err){
            return res.status(500).send(err)
        }
        else{
            res.status(200).json(results);
        }
    })
})





module.exports = router;