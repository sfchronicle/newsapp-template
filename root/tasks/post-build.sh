#!/bin/bash

# Super simple script to prep for git deploy

echo "Copying build to export..."
cp -a build/. "./public_export"

# If old styles and scripts are being referenced, this will cache-bust it:

echo "Appending cache-busting strings..."
random=`date +%s`
replaceJS="s/\.js/\.js?$random/g"
replaceCSS="s/\.css/\.css?$random/g"
perl -pi -e $replaceJS public_export/*.html
perl -pi -e $replaceCSS public_export/*.html
