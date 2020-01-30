const { src, dest, watch, series } = require('gulp')

const config = { env: process.env.NODE_ENV || 'development', paths: {} }

config.paths.docs = { scss: 'docs/scss' }
config.paths.src = { scss: 'src/scss' }
config.paths.build = { css: 'build/css' }
config.paths.dist = { css: 'dist/css' }

const tasks = {

    /**
     * Environment Tasks
     */

    env: {

        /**
         * @method tasks.development
         * @description Sets the Node environment to "development"
         */

        development: function() {

            return Promise.resolve(process.env.NODE_ENV = config.env = 'development')

        },

        /**
         * @method tasks.production
         * @description Sets the Node environment to "production"
         */

        production: function() {

            return Promise.resolve(process.env.NODE_ENV = config.env = 'production')

        }

    },

    /**
     * Compiler Tasks.
     */

    compile: {

        /**
         * @method compile.scss
         * @description Compiles SCSS into CSS.
         */

        scss: function() {

            const sass = require('gulp-sass')
            sass.compiler = require('node-sass')

            if(config.env === 'development') {

                const sourcemaps = require('gulp-sourcemaps')

                return src(`${config.paths.src.scss}/**/*.scss`)
                    .pipe(sourcemaps.init())
                    .pipe(sass.sync().on('error', sass.logError))
                    .pipe(sourcemaps.write('.'))
                    .pipe(dest(config.paths.build.css))

            }else{

                return src(`${config.paths.src.scss}/**/*.scss`)
                    .pipe(sass.sync().on('error', sass.logError))
                    .pipe(dest(config.paths.build.css))

            }

        },

        /**
         * @method compile.css
         * @description Autoprefixes and Minifies compiled CSS.
         */

        css: function() {

            const postcss = require('gulp-postcss')

            if(config.env === 'development') {

                return src(`${config.paths.build.css}/*.css`)
                    .pipe(postcss())
                    .pipe(dest(config.paths.dist.css))

            }else{

                const minifycss = require('gulp-csso')

                return src(`${config.paths.build.css}/*.css`)
                    .pipe(postcss())
                    .pipe(minifycss())
                    .pipe(dest(config.paths.dist.css))

            }

        }

    },


    docs: {

        scss: function() {

            if(config.env === 'development') {

                const sassdoc = require('sassdoc')

                return src(`${config.paths.src.scss}/**/*.scss`)
                    .pipe(sassdoc({
                        dest: config.paths.docs.scss,
                        groups: {
                            functions: 'Functions',
                            mixins: 'Mixins',
                            color: 'Color',
                            string: 'String',
                            viewport: 'Viewport',
                            variable: 'Variable',
                            undefined: 'General'
                        }
                    }))

            }

        }

    },


    /**
     * Watch Tasks.
     */

    watch: function() {

        // Watch configuration files for changes.
        watch('postcss.config.js', series(tasks.compile.css))

        // Watch SCSS files for changes.
        watch(`${config.paths.src.scss}/**/*.scss`, series(tasks.compile.scss))

        // Watch CSS files for changes.
        watch(`${config.paths.build.css}/**/*.css`, series(tasks.compile.css))

    }

}

exports.docs = series(tasks.env.development, tasks.docs.scss)
exports.development = exports.dev = exports.watch = series(tasks.env.development, tasks.compile.scss, tasks.compile.css, tasks.watch)
exports.production = exports.prod = series(tasks.env.production, tasks.compile.scss, tasks.compile.css)

exports.default = config.env === 'production' ? exports.production : exports.development