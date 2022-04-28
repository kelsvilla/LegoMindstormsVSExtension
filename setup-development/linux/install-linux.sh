#!/bin/bash

#* linux-install.sh: First-run setup script
#* Ensures git is installed, clones the repo, and then runs

export PS4='+(${BASH_SOURCE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
ELEVATE='';if (( $UID !=0 )); then ELEVATE='sudo';fi

help () {
   echo "Usage: $0 [-g path/to/git/directory]"
   exit 0
}


GITDIR="~/git"

# Get option flags:
dry=false
while getopts ghd arg; do
   case $arg in
      g) GITDIR="$OPTARG";;
      h) help;;
      d) dry=true;;
   esac
done

function dryrun {
   if $dry; then
      echo "> $* [dry]";
   else
      echo "> $*"
      $@
}

SETUPDIR="Mind_Reader/setup-development"
REPOURI="https://github.com/We-Dont-Byte/Mind_Reader.git"

# Install git
if which git; then
   echo "Git already installed."
elif which pacman; then
   # using pacman
   dryrun $ELEVATE pacman -Sy git
elif which apt; then
   # using apt
   dryrun $ELEVATE apt-get update && \
   dryrun $ELEVATE apt-get install git -y
fi #? TODO: other package managers?

echo Cloning repository into "$GITDIR"
dryrun mkdir "$GITDIR"
cd $GITDIR && git clone "$REPOURI"

# TODO: remove this when merging!
   cd Mind_Reader
   dryrun git checkout origin/johnBreaux
# TODO: remove this when merging!

cd "$GITDIR/$SETUPDIR"
bash ./linux-update.sh