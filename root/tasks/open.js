/*

Automatically opens your default browser and loads project

*/

module.exports = function(grunt) {

  grunt.loadNpmTasks("grunt-open");

  grunt.config.merge({

    open: {
      dev:{
       path: 'http://localhost:8000/'
      }
    }


  });

};
