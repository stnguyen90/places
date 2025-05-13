#!/bin/bash

set -e # Exit with nonzero exit code if anything fails

for function_dir in `ls -d appwrite-functions/*/`; do
    if [[ "$function_dir" == "appwrite-functions/common/" ]]; then
        continue
    fi
    cd $function_dir
    npm i
    npm run build
    cd -
done