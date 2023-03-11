#!/bin/bash

#* linux-install.sh: First-run setup script
#* Ensures git is installed, clones the repo, and then runs

export PS4='+(${BASH_SOURCE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
ELEVATE='';if (( $UID !=0 )); then ELEVATE='sudo';fi

help () {
   echo "Usage: $0 [-d] [-g path/to/git/directory]"
   exit 0
}


gitdir=~/git

# Get option flags:
dry=false
while getopts ghd arg; do
   case $arg in
      g) gitdir="$OPTARG";;
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
   fi
}

setupdir="Mind_Reader/setup-development/linux"
repouri="https://github.com/jcode999/Mind_Reader.git"

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

printf "\nCloning repository into $gitdir\n"
dryrun mkdir "$gitdir"
cd $gitdir && dryrun git clone "$repouri"

cd "$gitdir/$setupdir"
bash ./upgrade-linux.sh $@

echo "Opening VS Code..."
cd $gitdir/Mind_Reader
code .
