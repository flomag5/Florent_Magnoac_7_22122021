//--- Définition logique métier pour la ressource "post" ---//

// Importation 
const db = require("../models");
const Post = db.posts;
const Op = db.Sequelize.Op;
const fs = require("fs");


// Routes CRUD pour les posts

// Créer nouveau post
exports.createPost = (req, res, next) => {
    if (req.file) {
        Post.create({
            title: req.body.title,
            content: req.body.content,
            image: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            userId: req.body.userId
        })
            .then(() => res.status(201).json({ message: 'Post créé !' }))
            .catch(error => res.status(400).json({ error }));
    } else {
        Post.create({
            title: req.body.title,
            content: req.body.content,
            userId: req.body.userId
        })
            .then(() => res.status(201).json({ message: 'Post créé !' }))
            .catch(error => res.status(400).json({ error }));
    }

};


// Lecture de l'ensemble des posts
exports.findAll = (req, res, next) => {

    Post.findAll({
        include: [
            "comment", "user", "like"
        ],

        order: [["date", "DESC"]],
    })
        .then(response => res.status(200).json(response))
        .catch(err => console.log(err))
}


// Trouver un seul post
exports.findPostById = (req, res, next) => {

    Post.findOne({
        where: {
            id: req.params.id,
        },
        include: [

            "user", "comment", "like"

        ],
    })
        .then(response => res.status(200).json(response))
        .catch(err => console.log(err))
}


// Modifier un post par l'Id de la requête
exports.modifyPost = (req, res, next) => {
    const id = req.params.id;
    Post.findOne({ where: { id: id } })
        .then(post => {
            console.log(req.post.userId, "WAOUUUUUUUUUUUUUUUU")
            if (req.post.userId == post.userId) {
                const updatePost = {
                    title: req.body.title,
                    content: req.body.content
                }
                if (req.file) {
                    updatePost.image = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
                    const filename = post.image.split('/images/')[1];
                    fs.unlinkSync(`images/${filename}`)
                    console.log(post.image);
                }
                Post.update(updatePost, { where: { id: id } })
                    .then(() => res.status(200).json({ message: 'Post modifié !' }))
                    .catch(error => res.status(400).json({ error }))
            } else {
                return res.status(403).json({
                    'error': 'UnAuthorize'
                });
            }
        })
        .catch((error) => res.status(500).json({ error }));
};


// Supprimer un post 
exports.deletePost = (req, res, next) => {

    Post.findOne({
        where: {
            id: req.params.id,
        }
    })
        .then(post => {
            console.log(req.body.userId, "GOOOOOOOOOOOOD");
            if (req.body.userId == post.userId || req.body.isAdmin === 1) {

                const filename = post.image.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Post.destroy({
                        where: {
                            id: req.params.id
                        }
                    }).then(() => res.status(200).json({
                        message: 'Post supprimé !'
                    }))
                        .catch(error => res.status(400).json({
                            error
                        }));
                });
            } else {
                res.status(403).json({
                    'error': 'UnAuthorize'
                })
            }
        })
        .catch(error => res.status(500).json({
            error
        }));
};

