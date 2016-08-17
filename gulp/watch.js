'use strict';

var path = require ('path');
var gulp = require ('gulp');
var conf = require ('./conf');

var browserSync = require ('browser-sync');

function isOnlyChange (event) {
    return event.type === 'changed';
}

gulp.task ('watch', ['inject'], function () {

    gulp.watch ([
        path.join (conf.paths.src, '/**/*.html'),
        'bower.json'
    ], ['inject-reload']);

    gulp.watch ([
        path.join ('scss/**/*.scss'),
        path.join (conf.paths.src, '/app/**/*.css'),
        path.join (conf.paths.src, '/app/**/*.scss')
    ],  (event) => {
        if (isOnlyChange (event)) {
            gulp.start ('styles-reload');
        } else {
            gulp.start ('inject-reload');
        }
    });

    gulp.watch (path.join (conf.paths.src, '/app/**/*.js'),  (event) =>{
        if (isOnlyChange (event)) {
            gulp.start ('scripts-reload');
        } else {
            gulp.start ('inject-reload');
        }
    });

    gulp.watch (path.join (conf.paths.src, '/**/*.html'),  (event) => browserSync.reload (event.path));
});
