'use strict';

const path = require('path');
const gulp = require('gulp');
const conf = require('./conf');
const $ = require('gulp-load-plugins')();
const wiredep = require('wiredep').stream;
const _ = require('lodash');
const browserSync = require('browser-sync');

gulp.task('inject-reload', ['inject'], ()=> browserSync.reload());

gulp.task('inject', ['scripts', 'styles'],  ()=>{
  let injectStyles = gulp.src([
    path.join(conf.paths.tmp, '/serve/app/**/*.css'),
    path.join('!' + conf.paths.tmp, '/serve/app/vendor.css')
  ], { read: false });

  let injectScripts = gulp.src([
    path.join(conf.paths.src, '/app/**/*.module.js'),
    path.join(conf.paths.src, '/app/**/*.js'),
    path.join(conf.paths.src, '/app/app.js'),
    path.join('!' + conf.paths.src, '/app/**/*Spec.js'),
    path.join('!' + conf.paths.src, '/app/**/*.spec.js'),
    path.join('!' + conf.paths.src, '/app/**/*.mock.js'),
  ])
//   .pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'))
  ;

  let injectOptions = {
    ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/serve')],
    addRootSlash: false
  };

  return gulp.src(path.join(conf.paths.src, '/*.html'))
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve')));
});
