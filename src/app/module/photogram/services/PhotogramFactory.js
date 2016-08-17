(function () {
    'use strict';

    angular
        .module('app.photogram')
        .factory('Photogram', PhotogramFactory);

    function PhotogramFactory($q, Parse, User, Loading) {

        var currentUser = {};
        if (Parse.User.current()) {
            currentUser = Parse.User.current().attributes;
        }

        var limitComment = 3;

        return {
            addActivity: addActivity,
            listActivity: listActivity,
            all: all,
            home: home,
            post: post,
            get: get,
            deletePhoto: deletePhoto,
            find: find,
            nearby: nearby,
            // User
            profile: profile,
            getUser: getUser,
            getUserGallery: getUserGallery,
            getUserGalleryQtd: getUserGalleryQtd,
            // Comment
            allComment: allComment,
            addComment: addComment,
            getComments: getComments,
            updateComment: updateComment,
            deleteComment: deleteComment,
            // Like
            getLikes: getLikes,
            likeGallery: likeGallery,
            // Follow
            getFollow: getFollow,
            search: search
        };

        function loadProfile(response) {

            if (response) {
                var user = processImg(response);

                console.info(response, user);
                return user;
            } else {
                User.logout();
                return false;
            }
        }

        function deletePhoto(galleryId) {
            var defer = $q.defer();

            new Parse
                .Query('Gallery')
                .get(galleryId, function (resp) {
                    resp.destroy();
                    defer.resolve(resp);
                });

            return defer.promise;
        }

        function post(_params) {
            var defer = $q.defer();
            var ImageObject = Parse.Object.extend('Gallery');

            if (_params.photo !== '') {

                // create the parse file
                var imageFile = new Parse.File('mypic.jpg', {
                    base64: _params.photo
                });

                // save the parse file
                imageFile
                    .save()
                    .then(function () {

                        _params.photo = null;

                        // create object to hold caption and file reference
                        var imageObject = new ImageObject();

                        // set object properties
                        imageObject.set('title', _params.title);
                        imageObject.set('user', Parse.User.current());
                        imageObject.set('img', imageFile);

                        if (_params.location !== undefined) {
                            imageObject.set('location', new Parse.GeoPoint(_params.location.latitude, _params.location.longitude));
                        }

                        // save object to parse backend
                        imageObject
                            .save()
                            .then(function (resp) {
                                console.log('Posted Photo', resp);
                                // Add User QtdPhoto
                                defer.resolve(resp);
                            });

                    }, function (error) {
                        console.log('Error', error);
                        defer.reject(error);
                    });

            } else {
                // create object to hold caption and file reference
                var imageObject = new ImageObject();

                // set object properties
                imageObject.set('caption', _params.caption);

                // save object to parse backend
                return imageObject.save();

            }


            return defer.promise;
        }

        function allComment(galleryId) {
            var defer = $q.defer();

            var gallery = new Parse
                .Query('Gallery')
                .get(galleryId, function (resp) {
                    console.log(resp);
                    return resp;
                });

            new Parse
                .Query('GalleryComment')
                .equalTo('galery', gallery)
                //.include ('commentBy')
                .descending('createdAt')
                .find()
                .then(function (resp) {
                    var objs = [];
                    angular.forEach(resp, function (item) {
                        var obj = item.attributes;
                        obj.id = item.id;
                        obj.user = item.attributes.commentBy;
                        objs.push(obj);
                    });
                    Loading.end();
                    defer.resolve(objs);
                });
            return defer.promise;
        }

        function getComments(obj) {
            var defer = $q.defer();

            new Parse
                .Query('Gallery')
                .get(obj)
                .then(function (gallery) {
                    new Parse
                        .Query('GalleryComment')
                        .equalTo('gallery', gallery)
                        .include('commentBy')
                        .ascending('createdAt')
                        .find()
                        .then(function (resp) {
                            var comments = [];
                            resp.map(function (item) {
                                console.warn(item);
                                var obj = {
                                    id: item.id,
                                    text: item.attributes.text,
                                    created: item.createdAt
                                };
                                var userComment = item.attributes.commentBy.attributes;
                                // userComment.id = item.attributes.commentBy.id;
                                // obj.user = processImg(userComment);
                                comments.push(obj);
                            });
                            defer.resolve(comments);
                        });
                });

            return defer.promise;
        }

        function updateComment(obj) {
            var defer = $q.defer();
            console.log('updateComment', obj);
            new Parse
                .Query('GalleryComment')
                .get(obj.id, function (comment) {
                    console.log('updateComment comment', comment);
                    comment.set('text', obj.text);
                    comment.save();
                    defer.resolve();
                });
            return defer.promise;
        }

        function deleteComment(item) {
            var defer = $q.defer();
            new Parse
                .Query('GalleryComment')
                .get(item.id, deleteItem);

            function deleteItem(comment) {
                comment.destroy(function () {
                    defer.resolve();
                });
            }

            return defer.promise;
        }

        function getFollow(userId) {
            var defer = $q.defer();

            User
                .find(userId)
                .then(function (user) {

                    new Parse
                        .Query('UserFollow')
                        .equalTo('user', user)
                        .include('follow')
                        .find()
                        .then(function (resp) {
                            var data = [];
                            angular.forEach(resp, function (item) {
                                console.warn(item);
                                var obj = {
                                    id: item.id,
                                    text: item.attributes.text,
                                    user: item.attributes.follow.attributes,
                                    created: item.createdAt
                                };
                                obj.user = processImg(obj.user);

                                data.push(obj.user);
                            });
                            defer.resolve(data);
                        });
                });

            return defer.promise;
        }

        function getLikes(obj) {
            var defer = $q.defer();

            new Parse
                .Query('Gallery')
                .get(obj)
                .then(function (gallery) {
                    if (gallery.length) {
                        new Parse
                            .Query('GalleryLike')
                            .equalTo('gallery', gallery)
                            .include('user')
                            .ascending('createdAt')
                            .find()
                            .then(function (resp) {
                                var objs = [];
                                angular.forEach(resp, function (item) {
                                    console.warn(item);
                                    var obj = {
                                        id: item.id,
                                        text: item.attributes.text,
                                        user: item.attributes.user.attributes,
                                        created: item.createdAt
                                    };
                                    objs.push(obj);
                                });
                                console.log(objs);
                                defer.resolve(objs);
                            });
                    } else {
                        defer.reject(true);
                    }
                });

            return defer.promise;
        }


        function nearby(position) {
            var defer = $q.defer();
            var data = [];

            var point = new Parse.GeoPoint(position);
            var maxDistance = 1;

            new Parse
                .Query('Gallery')
            //.near('location', point)
                .include('user')
                .withinRadians('location', point, maxDistance)
                .limit(50)
                .find()
                .then(function (resp) {
                    if (resp.length) {
                        resp.map(function (value) {
                            var size = 100;
                            var obj = value.attributes;
                            obj.id = value.id;
                            obj.img = value.attributes.img.url();
                            obj.created = value.createdAt;
                            obj.icon = {
                                size: {
                                    width: 100,
                                    height: 100
                                },

                                scaledSize: {
                                    width: size / 2,
                                    height: size / 2
                                },
                                url: 'img/icon.png'
                            };
                            obj.icon.url = obj.img;
                            obj.coords = {
                                latitude: obj.location._latitude,
                                longitude: obj.location._longitude
                            };
                            data.push(obj);
                        });


                        defer.resolve(data);
                    } else {
                        defer.reject(true);
                    }
                });

            return defer.promise;
        }

        function search(string, page) {
            var defer = $q.defer();
            var data = [];
            var limit = 15;

            new Parse
                .Query('Gallery')
                .limit(limit)
                .skip(page * limit)
                .matches('title', '* ' + string + '.*')
                .include('user')
                .find()
                .then(function (resp) {
                    resp.map(function (value) {
                        console.log('gallery search item', value);
                        var obj = {
                            id: value.id,
                            item: value.attributes,
                            src: value.attributes.img.url(),
                            created: value.createdAt,
                            user: value.attributes.user.id
                        };
                        data.push(obj);
                    });
                    defer.resolve(data);
                });

            return defer.promise;
        }

        function home(page) {
            var defer = $q.defer();
            var limit = 4;
            var data = [];

            new Parse
                .Query('Gallery')
                .descending('createdAt')
                //.notEqualTo('user', user)
                //.containedIn('ref', following)
                //.containsAll('ref', following)
                .include('user')
                .limit(limit)
                .skip(page * limit)
                .find()
                .then(function (resp) {

                    console.log('home', resp);

                    var qtd = resp.length;

                    if (!qtd) {
                        defer.reject(true);
                    }

                    var cb = _.after(resp.length, function () {
                        defer.resolve(data);
                    });

                    _.each(resp, function (item) {
                        //grab relations

                        var likes = item.relation('likes');
                        var comments = item.relation('comments');

                        likes
                            .query()
                            .equalTo('gallery', item)
                            .equalTo('user', currentUser)
                            .count()
                            .then(function (liked) {

                                console.log(liked);

                                comments
                                    .query()
                                    .include('commentBy')
                                    .ascending('createdAt')
                                    .limit(limitComment)
                                    .find()
                                    .then(function (comments) {
                                        console.log(comments);

                                        var commentsData = [];

                                        comments.map(function (item) {
                                            var user = item.attributes.commentBy;

                                            var comment = {
                                                id: item.id,
                                                text: item.attributes.text,
                                                user: user.attributes
                                            };

                                            // comment.user.id = user.id;
                                            // comment.user = processImg(comment.user);
                                            commentsData.push(comment);
                                        });

                                        var obj = {
                                            id: item.id,
                                            item: item.attributes,
                                            created: item.createdAt,
                                            likes: likes,
                                            src: item.attributes.img.url(),
                                            comments: commentsData,
                                            user: item.attributes.user.attributes
                                        };


                                        data.push(obj);
                                        cb();
                                    });
                            });

                    });
                });

            return defer.promise;
        }

        /*
         * 1) Gallery, Limit
         * 2) GalleryComment, Limi
         * 3) Like, count, liked
         * */
        function all(page, userId) {
            var defer = $q.defer();
            var limit = 18;
            var data = [];

            var query;

            if (userId) {
                console.log(userId);
                var loadUser = new Parse
                    .Query('User')
                    .equalTo('objectId', userId)
                    .first(userId, function (resp) {
                        return resp;
                    });


                query = new Parse
                    .Query('Gallery')
                    .descending('createdAt')
                    .include('user')
                    .limit(limit)
                    .equalTo('user', loadUser)
                    .skip(page * limit)
                    .find();
            } else {

                query = new Parse
                    .Query('Gallery')
                    .descending('createdAt')
                    //.notEqualTo('user', Parse.User.current())
                    .include('user')
                    .limit(limit)
                    .skip(page * limit)
                    .find();
            }
            query
                .then(function (resp) {
                    if (resp.length) {

                        var cb = _.after(resp.length, function () {
                            defer.resolve(data);
                        });

                        _.each(resp, function (item) {
                            //grab relations

                            var likes = item.relation('likes');
                            var comments = item.relation('comments');

                            likes
                                .query()
                                .equalTo('gallery', item)
                                .equalTo('user', currentUser)
                                .count()
                                .then(function (liked) {

                                    comments
                                        .query()
                                        .include('commentBy')
                                        .ascending('createdAt')
                                        .limit(limitComment)
                                        .find()
                                        .then(function (comments) {
                                            console.log(comments);

                                            var commentsData = [];

                                            angular.forEach(comments, function (item) {
                                                var user = item.attributes.commentBy;
                                                var comment = {
                                                    id: item.id,
                                                    text: item.attributes.text,
                                                    user: user.attributes
                                                };
                                                comment.user.id = user.id;
                                                comment.user = processImg(comment.user);
                                                commentsData.push(comment);
                                            });

                                            var obj = {
                                                id: item.id,
                                                item: item.attributes,
                                                created: item.createdAt,
                                                likes: likes,
                                                src: item.attributes.img.url(),
                                                comments: commentsData
                                            };

                                            obj.item.liked = liked;

                                            if (item.attributes.user) {
                                                obj.user = item.attributes.user.attributes,
                                                    obj.user.id = item.attributes.user.id ? item.attributes.user.id : '',
                                                    obj.user = processImg(obj.user);
                                            } else {
                                                // remove gallery
                                            }

                                            data.push(obj);
                                            cb();
                                        });
                                });

                        });
                    } else {
                        defer.reject(true);
                    }

                });

            return defer.promise;
        }

        function get(item) {
            var defer = $q.defer();

            console.log(item);
            Loading.start();

            find(item)
                .then(function (resp) {
                    console.log(resp);

                    var likes = resp.relation('likes');
                    var comments = resp.relation('comments');

                    likes
                        .query()
                        .equalTo('gallery', item)
                        .equalTo('user', currentUser)
                        .count()
                        .then(function (liked) {

                            likes
                                .query()
                                .count()
                                .then(function (likes) {

                                    comments
                                        .query()
                                        .include('commentBy')
                                        .descending('createdAt')
                                        .limit(limitComment)
                                        .find()
                                        .then(function (comments) {
                                            console.log(comments);

                                            var commentsData = [];

                                            angular.forEach(comments, function (item) {
                                                var comment = {
                                                    id: item.id,
                                                    text: item.attributes.text,
                                                    user: item.attributes.commentBy.attributes
                                                };
                                                comment.user.id = item.id;
                                                commentsData.push(comment);
                                            });

                                            var obj = {
                                                id: item.id,
                                                item: item.attributes,
                                                created: item.createdAt,
                                                likes: likes,
                                                liked: liked,
                                                user: item.attributes.user.attributes,
                                                comments: commentsData
                                            };
                                            obj.user.id = item.attributes.user.id;
                                            obj.user = processImg(obj.user);

                                            defer.resolve(obj);
                                            Loading.end();
                                        });
                                });
                        });

                });

            return defer.promise;
        }

        function processImg(obj) {
            console.log(obj);
            if (obj) {
                if (obj.facebook) {
                    obj.src = (obj.facebookimg) ? obj.facebookimg : 'img/user.png';
                } else {
                    obj.src = (obj.img) ? obj.img.url() : 'img/user.png';
                }
                return obj;
            } else {
                return {};
            }
        }

        function find(id) {
            var defer = $q.defer();
            new Parse
                .Query('Gallery')
                .include('user')
                .get(id)
                .then(function (resp) {
                    defer.resolve(resp);
                });
            return defer.promise;
        }


        function addComment(form) {
            var defer = $q.defer();
            console.log('addComent', form);

            find(form.galleryId)
                .then(function (gallery) {
                    var Object = Parse.Object.extend('GalleryComment');
                    var item = new Object({});

                    angular.forEach(form, function (value, key) {
                        item.set(key, value);
                    });
                    item.set('commentBy', Parse.User.current());
                    item.set('gallery', gallery);

                    item.save(null)
                        .then(function (resp) {
                            console.log(resp);

                            addActivity({
                                galleryId: gallery.id,
                                action: 'add comment'
                            });

                            gallery
                                .relation('comments')
                                .add(resp);

                            gallery
                                .save()
                                .then(function (resp) {
                                    console.log(resp);
                                    defer.resolve(resp);
                                });
                        });
                });


            return defer.promise;
        }

        function isLiked(galleryId) {
            var defer = $q.defer();

            find(galleryId)
                .then(function (gallery) {
                    new Parse
                        .Query('GalleryLike')
                        .equalTo('gallery', gallery)
                        .equalTo('user', currentUser)
                        .first()
                        .then(function (resp) {
                            console.warn(resp);
                            if (resp === undefined) {
                                defer.reject(resp);
                            } else {
                                defer.resolve(resp);
                            }
                        });
                });

            return defer.promise;
        }

        function addLike(galleryId) {
            var defer = $q.defer();

            find(galleryId)
                .then(function (gallery) {
                    var Object = new Parse.Object.extend('GalleryLike');
                    var item = new Object({});

                    item.set('user', currentUser);
                    item.set('gallery', gallery);

                    console.log(gallery);

                    item.save(null)
                        .then(function (resp) {
                            console.log(resp);

                            // Gallery Increment Like
                            var likes = parseInt(gallery.attributes.qtdLike) ? parseInt(gallery.attributes.qtdLike + 1) : 1;
                            console.log('Qtd Like', likes);

                            // Increment Like
                            gallery
                                .set('qtdLike', likes);

                            // Add Relation
                            gallery
                                .relation('likes')
                                .add(resp);

                            console.log('Save Gallery', gallery);

                            // Save Gallery
                            gallery
                                .save()
                                .then(function (newGallery) {
                                    console.log(newGallery);
                                    defer.resolve({
                                        liked: true,
                                        likes: likes
                                    });
                                }, function (err) {
                                    console.error(err);
                                    defer.reject(err);
                                });
                        });
                });
            return defer.promise;
        }

        function removeLike(galleryId) {

            var defer = $q.defer();
            find(galleryId)
                .then(function (gallery) {

                    new Parse
                        .Query('GalleryLike')
                        .equalTo('gallery', gallery)
                        .equalTo('user', currentUser)
                        .first()
                        .then(function (like) {

                            var likes = parseInt(gallery.attributes.qtdLike - 1);
                            if (likes < 0) {
                                likes = 0;
                            }

                            console.log('Remove like', likes, gallery);


                            // Gallery Decrement Like
                            gallery
                                .set('qtdLike', likes);

                            // Remove Relation
                            gallery
                                .relation('likes')
                                .remove(like);

                            like
                                .destroy(function (resp) {
                                    if (resp) {
                                        console.log('Remove like');
                                        // Save Gallery
                                        gallery
                                            .save()
                                            .then(function (newGallery) {
                                                console.log('New Gallery', newGallery);

                                                defer.resolve({
                                                    liked: false,
                                                    likes: newGallery.attributes.qtdLike
                                                });

                                            }, function (err) {
                                                console.error(err);
                                                defer.reject(err);
                                            });
                                    }
                                });


                        });

                });
            return defer.promise;
        }

        function likeGallery(gallery) {
            var defer = $q.defer();

            isLiked(gallery)
                .then(function (resp) {
                    console.warn(resp);
                    var promise = '';

                    if (resp) {
                        console.log('Remove Like');
                        promise = removeLike(gallery);
                        addActivity({
                            galleryId: gallery,
                            action: 'unlike like'
                        });

                    } else {
                        console.log('Add like');
                        promise = addLike(gallery);
                        addActivity({
                            galleryId: gallery,
                            action: 'add like'
                        });
                    }

                    promise
                        .then(function (resp) {
                            console.log(resp);
                            defer.resolve(resp);
                        });

                })
                .catch(function (err) {
                    console.log('Add like', err);

                    addActivity({
                        galleryId: gallery,
                        action: 'add like'
                    });

                    addLike(gallery)
                        .then(function (resp) {
                            console.log(resp);
                            defer.resolve(resp);
                        });
                });
            return defer.promise;
        }


        function getUser(userId) {
            var defer = $q.defer();

            //todo: get user
            //todo: count user gallery
            //todo: count user follow
            //todo: count user following

            if (userId === undefined) {
                userId = currentUser.id;
            }

            console.log(userId);
            User
                .find(userId)
                .then(function (resp) {
                    console.log('getUser', resp);
                    var obj = resp.attributes;
                    obj.id = resp.id;
                    var user = loadProfile(obj);

                    // fotos
                    new Parse
                        .Query('Gallery')
                        .equalTo('user', resp)
                        .count()
                        .then(function (gallery) {
                            user.galleries = gallery;

                            // seguidores
                            new Parse
                                .Query('UserFollow')
                                .equalTo('follow', resp)
                                .count()
                                .then(function (follow1) {
                                    user.follow1 = follow1;

                                    // seguindo
                                    new Parse
                                        .Query('UserFollow')
                                        .equalTo('user', resp)
                                        .count()
                                        .then(function (follow2) {
                                            user.follow2 = follow2;

                                            // seguindo
                                            new Parse
                                                .Query('UserFollow')
                                                .equalTo('user', Parse.User.current())
                                                .equalTo('follow', resp)
                                                .count()
                                                .then(function (follow) {
                                                    user.follow = follow ? true : false;

                                                    console.log('getUser', user);
                                                    defer.resolve(user);

                                                });

                                        });

                                });
                        });
                });


            return defer.promise;
        }

        function getUserGalleryQtd(userId) {
            var defer = $q.defer();
            if (userId === undefined) {
                userId = currentUser.id;
            }

            User
                .find(userId)
                .then(function (user) {
                    new Parse
                        .Query('Gallery')
                        .equalTo('user', user)
                        .count()
                        .then(function (qtdGalleries) {
                            defer.resolve(qtdGalleries);
                        });
                });

            return defer.promise;
        }

        function getUserGallery(userId, page) {
            var defer = $q.defer();
            var data = [];
            var limit = 9;

            if (userId === undefined) {
                userId = currentUser.id;
            }

            User
                .find(userId)
                .then(function (user) {

                    new Parse
                        .Query('Gallery')
                        .equalTo('user', user)
                        .descending('createdAt')
                        //.containedIn('ref', following)
                        //.containsAll('ref', following)
                        .include('user')
                        .limit(limit)
                        .skip(page * limit)
                        .find()
                        .then(function (resp) {

                            if (resp.length) {
                                var cb = _.after(resp.length, function () {
                                    defer.resolve(data);
                                });

                                _.each(resp, function (item) {
                                    //grab relations

                                    var likes = item.relation('likes');
                                    var comments = item.relation('comments');

                                    likes
                                        .query()
                                        .equalTo('gallery', item)
                                        .equalTo('user', currentUser)
                                        .count()
                                        .then(function (liked) {

                                            likes
                                                .query()
                                                .count()
                                                .then(function (likes) {

                                                    comments
                                                        .query()
                                                        .include('commentBy')
                                                        .descending('createdAt')
                                                        .limit(limitComment)
                                                        .find()
                                                        .then(function (comments) {
                                                            console.log(comments);

                                                            var commentsData = [];

                                                            angular.forEach(comments, function (item) {
                                                                var comment = {
                                                                    id: item.id,
                                                                    text: item.attributes.text,
                                                                    user: item.attributes.commentBy.attributes
                                                                };
                                                                comment.user.id = item.id;
                                                                commentsData.push(comment);
                                                            });

                                                            var obj = {
                                                                id: item.id,
                                                                item: item.attributes,
                                                                src: item.attributes.img.url(),
                                                                created: item.createdAt,
                                                                likes: likes,
                                                                liked: liked,
                                                                comments: commentsData,
                                                                user: item.attributes.user.attributes
                                                            };
                                                            // obj.user.id = item.attributes.user.id;
                                                            // obj.user = processImg(obj.user);

                                                            data.push(obj);
                                                            cb();
                                                        });
                                                });
                                        });

                                });
                            } else {
                                defer.reject(true);
                            }
                        }, function () {
                            defer.reject(true);
                        });
                });

            return defer.promise;
        }

        function listActivity(page) {
            var defer = $q.defer();
            var limit = 20;

            console.info(page, limit);


            new Parse
                .Query('GalleryActivity')
                .include('user')
                .include('gallery')
                .descending('createdAt')
                .limit(limit)
                .skip(page * limit)
                .find()
                .then(function (resp) {
                    if (resp.length) {
                        var data = [];
                        resp.map(function (item) {
                            var obj = {
                                id: item.id,
                                user: item.attributes.user ? item.attributes.user.attributes : {name: 'User ',img: {_url: 'img/user.png'}},
                                img : item.attributes.gallery ? item.attributes.gallery.attributes.img : null,
                                action: item.attributes.action,
                                created: item.attributes.createdAt
                            };
                            data.push(obj);
                        });
                        defer.resolve(data);
                    } else {
                        defer.reject(true);
                    }
                });

            return defer.promise;
        }

        function addActivity(data) {
            /*
             * ACTIONS
             * add photo
             * add comment
             * like photo
             * unlike photo
             * register
             * */

            console.info(data);

            if (data.galleryId) {
                find(data.galleryId)
                    .then(function (gallery) {
                        var Object = Parse.Object.extend('GalleryActivity');
                        var item = new Object({});

                        item.set('user', Parse.User.current());
                        item.set('gallery', gallery);
                        item.set('action', data.action);

                        item.save()
                            .then(function (resp) {
                                console.warn(resp);
                            });
                    });
            } else {
                var Object = Parse.Object.extend('GalleryActivity');
                var item = new Object({});

                item.set('user', Parse.User.current());
                item.set('action', data.action);

                item.save()
                    .then(function (resp) {
                        console.warn(resp);
                    });
            }
        }

        function profile(userId) {
            var defer = $q.defer();
            var user = {};

            Loading.start();

            User
                .profile(userId)
                .then(function (respProfile) {
                    user = respProfile;

                    all(true, userId)
                        .then(function (galleries) {
                            user.feed = galleries;
                            console.log(user);
                            Loading.end();
                            defer.resolve(user);
                        });
                });


            return defer.promise;

        }


    }


})();