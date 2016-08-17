module.exports = {
    src    : {
        index    : 'www/index.html',
        fonts    : 'www/lib/ionic/fonts/**.*',
        imgs     : 'www/img/**/**.*',
        path     : 'www/',
        lib      : 'www/lib/*',
        sass     : [
            'scss/*.scss',
            'scss/**/*.scss'
        ],
        css      : [
            'www/css/*.css',
            'www/css/**/*.css',
            'www/fonts/***.css',
            'www/module/**/*.css'
        ],
        js       : [
            'www/app/*.js',
            'www/app/**/*.js',
            '!www/app/**/*.spec.js',
            'www/component/**/*.js',
            '!www/component/**/*.spec.js',
            'www/component/*.js',
            'www/module/*.js',
            'www/module/**/*.js',
            '!www/module/**/*.spec.js',
            'www/js/*.js'
        ],
        html     : [
            'www/module/**/*.html'
        ],
        translate: [
            'www/app/**/*.js',
            'www/app/**/**/*.js',
            '!www/app/**/**/*.spec.js',
            'www/app/**/view/*.html',

            'www/component/**/*.js',
            '!www/component/**/**/*.spec.js',
            'www/component/**/view/*.html',

            'www/module/**/**/*.js',
            '!www/module/**/*.spec.js',
            'www/module/**/view/*.html'
        ]
    },
    libs   : [
        'www/lib/ionicons/fonts'
    ],
    sass   : 'scss/ionic.app.scss',
    source : 'www',
    dist   : 'dist',
    docs   : 'docs',
    bower  : [
        'bower.json',
        '.bowerrc'
    ]
};
