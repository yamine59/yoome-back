require('dotenv').config();
const express = require('express');

//-----Upload
const multer = require('multer')
const path = require('path')

let storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './uploads/')     // './uploads/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

let upload = multer({
    storage: storage
});
// FIN Upload--------------------

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
router.post('/createProfil', upload.single('image'), async (req, res) => {

    const addDate = await date();
    let imgsrc;

    if (!req.file) {
        imgsrc = ""
    } else {
        console.log(req.file.filename)
        imgsrc = req.file.filename
    }

    const {
        children,
        situation,
        personality,
        hobby,
        description,
        localisation,
        sexual_preference,
        id_user
    } = req.body;

    const sql = ' INSERT INTO profiles (children, situation, personality, hobby, description, localisation, selfie, sexual_preference, created_at, id_user) VALUE (?,?,?,?,?,?,?,?,?,?)';
    db.query(sql, [children, situation, personality, hobby, description, localisation, imgsrc, sexual_preference, addDate, id_user], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(201).send({ message: 'profil créé' })
    })
})


router.post('/modifyProfil', (req, res) => {
    const { id_liked, id_user } = req.body;

    // Commencez par récupérer les ID likés existants
    const sqlSelect = 'SELECT id_liked FROM users WHERE id_user = ?';
    
    db.query(sqlSelect, [id_user], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        
        // Si aucun résultat n'est trouvé, on ne peut pas modifier
        if (result.length === 0) {
            return res.status(404).json({ message: 'Profil non trouvé' });
        }
        
        // Récupérez les ID likés existants
        const existingLikedIds = result[0].id_liked ? result[0].id_liked.split(',') : [];
        
        // Ajoutez l'id_liked seulement s'il n'est pas déjà présent
        if (!existingLikedIds.includes(id_liked.toString())) {
            existingLikedIds.push(id_liked.toString());
        }

        // Convertissez le tableau d'IDs en une chaîne de caractères séparée par des virgules
        const newLikedIds = existingLikedIds.join(',');

        // Mettez à jour le profil avec la nouvelle chaîne d'IDs
        const sqlUpdate = 'UPDATE users SET id_liked = ? WHERE id_user = ?';
        
        db.query(sqlUpdate, [newLikedIds, id_user], (err, result) => {
            if (err) {
                return res.status(500).send(err);
            } else {
                res.status(201).json({
                    message: 'Profil modifié avec succès'
                });
            }
        });
    });
});


//delete profil (Must delete only profil, not profil + users)
router.post('/eraseProfil/:id', (req, res) => {

    const idUser = req.params.id

    const sql = 'DELETE FROM profiles WHERE id_user = ?';

    db.query(sql, [idUser], (err, result) => {
        if (err) {
            return res.status(500).send(err)
        }
        else {
            res.status(201).json({
                message: 'Utilisateur effacé'
            })
        }

    })
})

// read Profil
router.get('/showProfil/:id', (req, res) => {

    const idUser = req.params.id

    const sql = 'SELECT * FROM profiles WHERE id_user = ?';

    db.query(sql, [idUser], (err, results) => {
        if (err) {
            return res.status(500).send(err)
        }
        else {
            res.status(200).json(results);
        }
    })
})

router.get('/showProfil', (req, res) => {

    const idUser = req.params.id

    const sql = 'SELECT * FROM profiles  ';

    db.query(sql, [idUser], (err, results) => {
        if (err) {
            return res.status(500).send(err)
        }
        else {
            res.status(200).json(results);
        }
    })
})



module.exports = router;