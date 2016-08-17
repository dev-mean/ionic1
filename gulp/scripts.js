'use strict';

const path = require ('path');
const gulp = require ('gulp');
const conf = require ('./conf');
const browserSync = require ('browser-sync');
const $ = require ('gulp-load-plugins') ();


gulp.task ('scripts-reload',  () => {
    return buildScripts ()
        .pipe (browserSync.stream ());
});

gulp.task ('scripts',  () =>{
    return buildScripts ();
});

function buildScripts () {
    return gulp
        .src ([
            path.join(conf.paths.src, '/app/**/*.module.js'),
            path.join(conf.paths.src, '/app/**/*.js'),
            path.join(conf.paths.src, '/app/app.js'),
            path.join('!' + conf.paths.src, '/app/**/*Spec.js'),
            path.join('!' + conf.paths.src, '/app/**/*.spec.js'),
            path.join('!' + conf.paths.src, '/app/**/*.mock.js'),
        ])
        .pipe ($.eslint ())
        .pipe ($.eslint.format ())
        .pipe ($.size ());
};
