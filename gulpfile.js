/**
 *  Welcome to your gulpfile!
 *  The gulp tasks are splitted in several files in the gulp directory
 *  because putting all here was really too long
 */

'use strict';

var bower = require('bower');
var http = require('http');
var fs = require('fs');
var gulp = require('gulp');
var concat = require('gulp-concat');
var wrench = require('wrench');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var bowerFiles = require('main-bower-files');
var inject = require('gulp-inject');
var filter = require('gulp-filter');
var minifyCss = require('gulp-minify-css');
var tsc = require('gulp-typescript');
var tslint = require('gulp-tslint');
var browserSync = require('browser-sync').create();
var paths = {
    libJs: ['bower_components/ionic/js/ionic.bundle.js'
            ,'bower_components/ngImgCrop/compile/minified/ng-img-crop.js'
            ,'bower_components/parse-angular-patch/parse-angular.js'
    ], // files which aren't in the bower main config
    libCss: ['bower_components/ngImgCrop/compile/minified/ng-img-crop.css'
            , 'bower_components/angular-slider/slider.css'], // files which aren't in the bower main config
    ts: './src/app/module/photogram/**/*.ts',
    tsTypings: './tools/typings/',
    tsLibDefinitions: './tools/typings/**/*.ts',
    tsAppReferences: './tools/typings/typescriptApp.d.ts',
    tsTestsExclusion: '!./tools/typings/**/*-tests.ts',
    tsOutput: './src/ts-js',
    fonts: [
        './bower_components/ionicons/fonts/*',
        './app/fonts/*'
    ],
    audios: './src/audio/*'
};
var bowerConf = {
    paths: './',
    includeDev: true
};
/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter((file) => {
  return (/\.(js|coffee)$/i).test(file);
}).map((file) => require('./gulp/' + file));


/**
 *  Default task clean temporaries directories and launch the
 *  main optimization build task
 */
gulp.task('default', ['clean', 'watch','ts-lint', 'lib-css', 'compile-ts', 'gen-ts-refs'], () => gulp.start('build'));
/**  TypeScript tasks - for further reading see https://weblogs.asp.net/dwahlin/creating-a-typescript-workflow-with-gulp */

/**
 * Generates the app.d.ts references file dynamically from all application *.ts files.
 */
gulp.task('gen-ts-refs', function () {
    var target = gulp.src(paths.tsAppReferences);
    var sources = gulp.src(paths.ts, {read: false});
    return target.pipe(inject(sources, {
        starttag: '//{',
        endtag: '//}',
        transform: function (filepath) {
            return '/// <reference path="../..' + filepath + '" />';
        }
    })).pipe(gulp.dest(paths.tsTypings));
});

/**
 * Lint all custom TypeScript files.
 */
gulp.task('ts-lint', function () {
    return gulp.src(paths.ts).pipe(tslint()).pipe(tslint.report('prose'));
});

gulp.task('lib-css', function(done) {
    gulp.src(bowerFiles(bowerConf).concat(paths.libCss))
        .pipe(filter(['**/*.css', '!ionic.css'])) // exclude the ionic.css built from the sass task
        //.pipe(print())
        .pipe(concat('lib.css'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest('./www/styles/'))
        .on('end', done);
});

/*
 | --- Fonts ------------------------------------------
 */

gulp.task('fonts', function() {
    return gulp.src(paths.fonts)
        //.pipe(print())
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest('./www/fonts/'));
});

/*
 | --- Audio ------------------------------------------
 */

gulp.task('audios', function() {
    return gulp.src(paths.audios)
        //.pipe(print())
        .pipe(rename({dirname: ''}))
        .pipe(gulp.dest('./www/audio/'));
});
/**
 * Compile TypeScript and include references to library and app .d.ts files.
 */
gulp.task('compile-ts', function () {
    var sourceTsFiles = [paths.ts,                //path to typescript files
        paths.tsLibDefinitions, //reference to library .d.ts files
        paths.tsAppReferences,     //reference to app.d.ts files
        paths.tsTestsExclusion] // exclude the test files

    var tsResult = gulp.src(sourceTsFiles)
        .pipe(sourcemaps.init())
        .pipe(tsc({
            target: 'ES6',
            declarationFiles: false,
            noExternalResolve: true
        }))

    tsResult.dts.pipe(gulp.dest(paths.tsOutput));
    return tsResult.js
        .pipe(babel({}))
        .pipe(concat('app.ts.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('./www/scripts'))
});
gulp.task('watch', function() {
    gulp.watch(paths.ts, ['ts-lint', 'compile-ts', 'lib-css', 'gen-ts-refs']);
});
