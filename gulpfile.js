const gulp = require('gulp');
const uglify = require('gulp-uglify');
const gLess = require('gulp-less');
const del = require('del');
const gRename = require('gulp-rename');
const gCleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const newer = require('gulp-newer');
const browsersync = require('browser-sync').create();

const paths = {
	html: {
		src: 'src/*.html',
		dest: 'dist',
	},
	styles: {
		src: 'src/styles/**/*.less',
		dest: 'dist/css/',
	},
	scripts: {
		src: 'src/scripts/**/*.js',
		dest: 'dist/js/',
	},
	images: {
		src: 'src/img/*',
		dest: 'dist/img',
	},
};
function clean() {
	return del(['dist/*', '!dist/img']);
}

function html() {
	return gulp
		.src(paths.html.src)
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest(paths.html.dest))
		.pipe(browsersync.stream());
}

function styles() {
	return gulp
		.src(paths.styles.src)
		.pipe(sourcemaps.init())
		.pipe(gLess())
		.pipe(
			autoprefixer({
				cascade: false,
			})
		)
		.pipe(
			gCleanCSS({
				level: 2,
			})
		)
		.pipe(
			gRename({
				basename: 'main',
				suffix: '.min',
			})
		)
		.pipe(sourcemaps.write('.'))
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browsersync.stream());
}

function scripts() {
	return gulp
		.src(paths.scripts.src)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(uglify())
		.pipe(concat('main.min.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(browsersync.stream());
}

function watch() {
	browserSync.init({
		server: './src/',
	});
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.scripts.src, scripts);
}

function img() {
	return gulp
		.src(paths.images.src)
		.pipe(newer(paths.images.dest))
		.pipe(imagemin({ progressive: true }))
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest(paths.images.dest));
}

const build = gulp.series(
	clean,
	html,
	gulp.parallel(styles, scripts, img),
	watch
);

exports.clean = clean;
exports.img = img;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.default = build;
