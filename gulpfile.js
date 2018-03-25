var gulp         = require("gulp"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    htmlMinifier = require("gulp-htmlmin"),
    hash         = require("gulp-hash"),
    del          = require("del")

gulp.task("clean", function() {
    // Delete files synchronically so there are no errors while copying files.
    del.sync(["static/**", "data/static/**"], { force: true })
})

// Compile boostrap scss.
gulp.task("scss-bs", function () {
    gulp.src("src/scss/bootstrap.scss", { base: "src/scss/" })
        .pipe(sass({
            outputStyle : "compressed"
        }))
        .pipe(autoprefixer({
            browsers : ["last 10 versions"]
        }))
        .pipe(hash())
        .pipe(gulp.dest("static/css"))
        // Create a hash map (manifest) and put it into data directory so
        // we can find out what hash to use in hugo. (.Site.Data is globally
        // accessible in hugo.
        .pipe(hash.manifest("hash.json"))
        .pipe(gulp.dest("data/static/css"))
})

// Copy bootstrap javascript files.
gulp.task("js-bs", function () {
    // bootstrap.bundle.min.js includes popper.js.
    gulp.src(["node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", "node_modules/jquery/jquery.min.js"])
        .pipe(hash())
        .pipe(gulp.dest("static/js"))
        .pipe(hash.manifest("hash.json"))
        .pipe(gulp.dest("data/static/js"))
})

// Images.
// TODO: Image minify
gulp.task("img", function () {
    gulp.src("src/img/**/*", { base: "src/img/" })
        .pipe(hash())
        .pipe(gulp.dest("static/img"))
        .pipe(hash.manifest("hash.json"))
        .pipe(gulp.dest("data/static/img"))
})

gulp.task("build-static", ["clean", "scss-bs", "js-bs", "img"])

// Post hugo generation tasks

gulp.task("hugo-html-minify", function () {
    gulp.src("public/**/*.html", { base: "public/" })
        .pipe(htmlMinifier({ collapseWhitespace: true }))
        .pipe(gulp.dest("public/"))
})
