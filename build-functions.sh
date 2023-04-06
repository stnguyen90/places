#!/bin/bash

set -e # Exit with nonzero exit code if anything fails

for function_dir in `ls -d appwrite-functions/*/`; do
    cd $function_dir
    npm i
    npm run build
    cd -
done