const { src, dest, watch, series } = require('gulp')

const config = { env: process.env.NODE_ENV || 'development', paths: {} }

config.paths.sass = { src: 'src/scss',  dest: 'src/css' }
config.paths.css  = { src: 'src/css', dest: 'build/css'  }


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
          const glob = require('gulp-sass-glob')

          sass.compiler = require('node-sass')

          if(config.env === 'development') {

            const sourcemaps = require('gulp-sourcemaps')

            return src(`${config.paths.sass.src}/styles.scss`)
              .pipe(sourcemaps.init())
              .pipe(glob())
              .pipe(sass.sync().on('error', sass.logError))
              .pipe(sourcemaps.write('.'))
              .pipe(dest(config.paths.css.src))

          }else{

            return src(`${config.paths.sass.src}/styles.scss`)
              .pipe(glob())
              .pipe(sass.sync().on('error', sass.logError))
              .pipe(dest(config.paths.css.src))

          }

        },

        /**
         * @method compile.css
         * @description Autoprefixes and Minifies compiled CSS.
         */

        css: function() {

            const postcss = require('gulp-postcss')

            if(config.env === 'development') {

                return src(`${config.paths.css.src}/*.css`)
                    .pipe(postcss())
                    .pipe(dest(config.paths.css.dest))

            }else{

                const purgecss = require('gulp-purgecss')
                const mediaqueries = require('gulp-group-css-media-queries')
                const minifycss = require('gulp-csso')

                return src(`${config.paths.css.src}/*.css`)
                    .pipe(purgecss({
                      content: [
                        '**/*.html', 
                        '**/*.php', 
                        '**/*.blade', 
                        '**/*.vue'
                      ]
                    }))
                    .pipe(postcss())
                    .pipe(mediaqueries())
                    .pipe(minifycss())
                    .pipe(dest(config.paths.css.dest))

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
        watch(`${config.paths.sass.src}/**/*.scss`, series(tasks.compile.scss))

        // Watch CSS files for changes.
        watch(`${config.paths.css.src}/**/*.css`, series(tasks.compile.css))

    }

}

exports.development = exports.dev = exports.watch = series(tasks.env.development, tasks.compile.scss, tasks.compile.css, tasks.watch)
exports.production = exports.prod = series(tasks.env.production, tasks.compile.scss, tasks.compile.css)

exports.default = config.env === 'production' ? exports.production : exports.development