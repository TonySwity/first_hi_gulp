const gulp = require('gulp');
const ts = require('gulp-typescript');
const coffee = require('gulp-coffee');
const stylus = require('gulp-stylus');
const sass = require('gulp-sass')(require('sass'));
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
const gulpPug = require('gulp-pug');

const paths = {
	html: {
		src: 'src/*.html',
		dest: 'dist/',
	},
	pug: {
		src: 'src/*.pug',
		dest: 'dist/',
	},
	styles: {
		src: [
			'src/styles/**/*.sass',
			'src/styles/**/*.scss',
			'src/styles/**/*.styl',
			'src/styles/**/*.less',
		],
		dest: 'dist/css/',
	},
	scripts: {
		src: [
			'src/scripts/**/*.coffee',
			'src/scripts/**/*.ts',
			'src/scripts/**/*.js',
		],
		dest: 'dist/js/',
	},
	images: {
		src: 'src/img/**',
		dest: 'dist/img',
	},
};
function clean() {
	return del(['dist/*', '!dist/img']);
}

function pug() {
	return gulp
		.src(paths.pug.src)
		.pipe(gulpPug())
		.pipe(size({ showFiles: true }))
		.pipe(gulp.dest(paths.pug.dest))
		.pipe(browsersync.stream());
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
	return (
		gulp
			.src(paths.styles.src)
			.pipe(sourcemaps.init())
			//.pipe(gLess())
			//.pipe(stylus())
			.pipe(sass().on('error', sass.logError))
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
			.pipe(browsersync.stream())
	);
}

function scripts() {
	return (
		gulp
			.src(paths.scripts.src)
			.pipe(sourcemaps.init())
			.pipe(coffee({ bare: true }))
			// .pipe(
			// 	ts({
			// 		noImplicitAny: true,
			// 		outFile: 'main.min.js',
			// 	})
			// )
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
			.pipe(browsersync.stream())
	);
}

function watch() {
	browsersync.init({
		server: './dist/',
	});
	gulp.watch(paths.html.dest).on('change', browsersync.reload);
	gulp.watch(paths.html.src, html);
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.scripts.src, scripts);
	gulp.watch(paths.images.src, img);
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
exports.pug = pug;
