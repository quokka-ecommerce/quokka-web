var gulp = require('gulp');
var connect = require('gulp-connect');
var less = require('gulp-less');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var del = require('del');

var jshint = require('gulp-jshint');
var jsFiles = ['*.js', 'assets/app/**/*.js'];

var nodemon = require('gulp-nodemon');

// for unstop the piped stream and continue watch
var plumber = require('gulp-plumber');
var tap        = require('gulp-tap');
var gulpif     = require('gulp-if');
var streamify  = require('gulp-streamify');

var browserify = require('browserify');
var source = require('vinyl-source-stream');

// plugins for minify css
var LessPluginCleanCSS = require('less-plugin-clean-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    autoprefix= new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });

var args   = require('yargs').argv;

gulp.task('connect', function () {
    connect.server({
        root: 'public/',
        port: 4000,
        fallback: 'public/views/index.html'
    });
});

var isProduction = args.env === 'production';

// auto restart when changes happen
gulp.task('dev', ['watch'], function() {
    var options = {
        script: 'app.js',
        delayTime: 1,
        env: {
            PORT: '5000'
        },
        watch: jsFiles
    };
    return nodemon(options)
        .on('restart', function (ev) {
            console.log('restarting....');
    });
});

// debug mode to show errors
gulp.task('js-style', function(){
   gulp.src(jsFiles)
       .pipe(jshint())
       .pipe(jshint.reporter('jshint-stylish'), {
           verbose: true
       });
});

// bundles all js file to main.js
gulp.task('browserify', function() {
    // clean the prevoius js version
    del(['public/js/*.js']);
    return browserify('assets/app/app.js')
        .bundle()
        .on('error', function (err) {
            gutil.log(
                gutil.colors.red('Browserify compile error:'),
                err.message
            );
            gutil.beep();
            // Ends the task
            this.emit('end');
        })
        .pipe(source('main.js'))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('less', function () {
    // delete previous css
    del(['public/css/main.css']);
    var l = less({});
    if (isProduction) {
        l = less({plugins: [autoprefix, cleancss]});
    }
    return gulp.src('assets/css/*.less')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }}))
        .pipe(l)
        .on('error', gutil.log)
        .pipe(gulp.dest('public/css/'));
});

gulp.task('clean', function() {
    del(['public/js/*.js']);
    del(['public/css/main.css']);
});

gulp.task('watch', function(){
    // Watches for changes for js
    gulp.watch('assets/app/**/*.js', ['browserify', 'js-style']);
    // Watches for changes for css
    gulp.watch('assets/css/*.less', ['less']);
});

// default tasks
gulp.task('default', ['dev']);
