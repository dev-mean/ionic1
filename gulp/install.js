'use strict';
const path  = require('path');
const gulp  = require('gulp');
const gutil  = require('gulp-util');
const bower = require('bower');
const paths = gulp.paths;

gulp.task('install', ['git-check'],  () =>{
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});
