require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const jwt = require('jsonwebtoken')

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    database: process.env.DB_NAME,
    token: process.env.TOKEN_SECRET

})

//--------------------- CRUD user (create, read, update, delete)

//create
router.post('/register',async (req,res) => {
    const {email,password,firstname,lastname,birthdate } = req.body;
    const hashedPassword = await bcrypt.hash(password,10);

    const sql =' INSERT INTO users (email,password,firstname,lastname,birthdate) VALUE (?,?,?,?,?) ';
    db.query(sql,[email,hashedPassword,firstname,lastname,birthdate], (err,result) =>{
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({message: 'Utilisateur créé'})
    })
})

//delete
router.post('/eraseUser/:id', (req, res) => {

    const idUser = req.params.id
    
    const sql = 'DELETE FROM users WHERE id_user = ?';

    db.query(sql, [idUser], (err,result) =>{
        if(err){
            return res.status(500).send(err)
        }
        else{
            res.status(201).json({
                message: 'Utilisateur effacé'
            })
        }

    })
})

//update
router.post ('/modifyUser/:id', async (req, res) => {

    const idUser = req.params.id

    const { email, password, firstname, lastname, birthdate } = req.body;
    const hashedPassword = await bcrypt.hash(password,10);
    const sql = 'UPDATE users SET email = ?, password = ?, firstname = ?, lastname = ?, birthdate = ? WHERE id_user = ?';

    db.query(sql, [email, hashedPassword, firstname, lastname, birthdate, idUser], (err,result) =>{
        if(err){
            return res.status(500).send(err)
        }
        else{
            res.status(201).json({
                message: 'Utilisateur modifié'
            })
        }
    })
})

//read
router.get('/listUser', (req, res) =>{
    
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, results) =>{
        if(err){
            return res.status(500).send(err);
        }
        else{
            res.status(200).json(results); 
        }
    })
})

router.post('/listUser/:id', (req, res) =>{
    const idUser = req.params.id
    const sql = 'SELECT * FROM users WHERE id_user = ?';
    db.query(sql,[idUser], (err, results) =>{
        if(err){
            return res.status(500).send(err);
        }
        else{
            res.status(200).json(results); 
        }
    })
})

//-------------------------------------------- 

// Login / connexion
router.post('/login', async (req,res) => {
    const {email,password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?'
   
    db.query(sql,[email,password], async (err,results) =>{
        const user = results[0];

        if (results.length === 0 || !(await bcrypt.compare(password, user.password))) {

            return res.status(500).send({ message: 'mdp incorrect' });

        }
        const token = jwt.sign(
            {
                id: user.id_user,
                email: user.email,
                role: user.role,
                lastname: user.lastname,
                firstname: user.firstname,
                birthdate: user.birthdate

            },
            process.env.TOKEN_SECRET, 
            { expiresIn: '1h' }
        );
        res.status(200).json({

            message: 'Utilisateur connecté', token: token
        });
    })
})





// ff

module.exports = router;