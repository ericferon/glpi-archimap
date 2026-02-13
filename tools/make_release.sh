#!/bin/bash

PLUGINNAME="rcsangola"

if [ ! "$#" -eq 2 ]
then
    echo "Usage $0 fi_git_dir release"
    exit
fi

read -p "Are translations up to date? [Y/n] " -n 1 -r
echo    # (optional) move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]] 
    then
    [[ "$0" = "$BASH_SOURCE" ]] && exit 1 || return 1 # handle exits from shell or function but don't exit interactive shell
fi

INIT_DIR=$1
RELEASE=$2

# remove old tmp files
if [ ! -e /tmp/$PLUGINNAME ]
then
    echo "Deleting temp directory"
    rm -rf /tmp/$PLUGINNAME
fi

# test plugin_cvs_dir
if [ ! -e $INIT_DIR ] 
then
    echo "$1 does not exist"
    exit 
fi

INIT_PWD=$PWD;

if [ -e /tmp/$PLUGINNAME ]
then
    echo "Delete existing temp directory"
    rm -rf /tmp/$PLUGINNAME
fi

echo "Copy to  /tmp directory"
git checkout-index -a -f --prefix=/tmp/$PLUGINNAME/

if [ -e vendor ]
then
    cp -R vendor/ /tmp/$PLUGINNAME/
fi

echo "Move to this directory"
cd /tmp/$PLUGINNAME

echo "Check version"
if grep --quiet $RELEASE setup.php; then
    echo "$RELEASE found in setup.php, OK."
else
    echo "$RELEASE has not been found in setup.php. Exiting."
    exit 1
fi

echo "Compile locale files"
./tools/generate_locales.sh

echo "Delete various scripts and directories"
rm -rf RoboFile.php
rm -rf tools
rm -rf phpunit
rm -rf tests
rm -rf .gitignore
rm -rf .travis.yml
rm -rf .coveralls.yml
rm -rf phpunit.xml.dist
rm -rf composer.lock
rm -rf .composer.hash
rm -rf ISSUE_TEMPLATE.md
rm -rf PULL_REQUEST_TEMPLATE.md
rm -rf .tx
rm -rf $PLUGINNAME.xml
rm -rf screenshots
rm -rf locales/localazy*

echo "Creating tarball"
cd ..
tar czf "glpi-$PLUGINNAME-$RELEASE.tar.tgz" $PLUGINNAME

cd $INIT_PWD;

echo "Deleting temp directory"
rm -rf /tmp/$PLUGINNAME

echo "The Tarball is in the /tmp directory"
