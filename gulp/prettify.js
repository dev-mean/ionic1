'use strict';
const path     = require('path');
const gulp     = require('gulp');
const prettify = require('gulp-jsbeautifier');
const conf = require('./conf');

// Prettify Code
gulp.task('prettify', [
    'prettify:js:app',
    'prettify:html:app'
]);

gulp.task('prettify:js:app',  () => {
    gulp.src(conf.paths.src +'/app/**/*.js')
        .pipe(prettify({config: ".jsbeautifyrc"}))
        .pipe(gulp.dest(conf.paths.src + '/app'));
});


// HTML
gulp.task('prettify:html:app',  () => {
    gulp.src(conf.paths.src + '/app/**/*.html')
        .pipe(prettify({
            braceStyle         : 'collapse',
            indentChar: " ",
            indentScripts: "keep",
            indentSize   : 4,
            maxPreserveNewlines: 10,
            preserveNewlines   : true,
            wrapLineLength     : 0
        }))
        .pipe(gulp.dest(conf.paths.src + '/app'));
});
