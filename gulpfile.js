"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect'); //Runs a local dev server
var open = require('gulp-open'); //Open a URL in a web browser
var browserify = require('browserify'); // Bundles JS
var reactify = require('reactify');  // Transforms React JSX to JS
var source = require('vinyl-source-stream'); // Use conventional text streams with Gulp
var concat = require('gulp-concat'); //Concatenates files
var jshint = require("gulp-jshint"); //Lint JS files
var sass = require('gulp-sass'); // Good ol gulp sass
var rename = require('gulp-rename'); // Gulp rename for minified css files 
var cleanCss = require('gulp-clean-css'); // Css minifiyer
var imagemin = require('gulp-imagemin'); // Image optimisation



// A comment break line 
var config = {
	port: 3000,
	devBaseUrl: 'http://localhost'
}

//Start a local development server
gulp.task('connect', function() {
	connect.server({
		root: ['./'],
		port: config.port,
		base: config.devBaseUrl,
		livereload: true
	});
});

gulp.task('open', ['connect'], function() {
	gulp.src('./index.html')
		.pipe(open({ uri: config.devBaseUrl + ':' + config.port + '/'}));
});

gulp.task('css', function() {
	gulp.src('./css')
		.pipe(connect.reload());
});

gulp.task('watch', function() {
	gulp.watch('./css/*.css', ['css']);
});

gulp.task('default', ['watch', 'css', 'open']);