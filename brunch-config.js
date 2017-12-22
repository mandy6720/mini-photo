module.exports = {
  files: {
    javascripts: {
      joinTo: {
        'vendor.js': /^(?!app)/,
        'app.js': /^app/
      }
    },
    stylesheets: {joinTo: 'app.css'}
  },

  plugins: {
    babel: {presets: ['es2015']},
    eslint: {
      pattern: /^app\/.*\.js?$/,
      warnOnly: true,
      config: {
        ecmaFeatures: {
          "jsx": true,
          "modules": true
        },
        extends: "airbnb-base",
        parser: "babel-eslint",
        rules: {
          'array-callback-return': 'warn'
        },
      }
    }
  },

  overrides : {
    production : {
      paths : {
        public : 'build'
      }
    }
  }
};
