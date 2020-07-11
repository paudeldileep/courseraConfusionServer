const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');

const Favorites = require('../models/favorite')


const cors = require('./cors');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        Favorites.find({
                user: userId
            })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        var dishId = req.body.id;

        Favorites.count({
                user: userId
            })
            .then((count) => {
                if (count === 0) {
                    Favorites.create({
                            user: userId
                        })
                        .then((favorite) => {
                            favorite.dishes.push(dishId);
                            favorite.save()
                                .then((favorite) => {
                                    console.log('Favorites Added ', favorite);
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                });
                        });
                } else {
                    Favorites.findOne({
                            user: userId
                        })
                        .then((favorite) => {
                            favorite.dishes.push(dishId);
                            favorite.save()
                                .then((favourite) => {
                                    res.statusCode = 200;
                                    console.log('Updated Favorite!');
                                    res.json(favorite);
                                });
                        });
                }
            });


    })

    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        Favorites.remove({
                user: userId
            })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        var userId = req.user._id;
        var dishId = req.params.dishId;

        Favorites.count({
                user: userId
            })
            .then((count) => {
                if (count === 0) {
                    Favorites.create({
                            user: userId
                        })
                        .then((favorite) => {
                            favorite.dishes.push(dishId);
                            favorite.save()
                                .then((favorite) => {
                                    console.log('Favorites Added ', favorite);
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                });
                        });
                } else {
                    Favorites.findOne({
                            user: userId
                        })
                        .then((favorite) => {
                            favorite.dishes.push(dishId);
                            favorite.save()
                                .then((favourite) => {
                                    res.statusCode = 200;
                                    console.log('Added dish to Favorite!');
                                    res.json(favorite);
                                });
                        });
                }
            });


    })
    //for deleting a dish item from dishes array
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        var dishId = req.params.dishId;
        userId = req.user._id;
        Favorites.count({
                user: userId
            })
            .then((count) => {
                if (count != 0) {
                    Favorites.findOne({
                            user: userId
                        })
                        .then((favorite) => {
                            for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
                                if (favorite.dishes[i] == dishId) {
                                    favorite.dishes.pull(dishId);
                                  }
                            }
                            favorite.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        });
                } else {
                    res.statusCode = 403;
                    res.end('given dish not found under favorites');
                }
            });
    });
module.exports = favoriteRouter;