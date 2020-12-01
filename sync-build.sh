#!/usr/bin/env bash

export LC_CTYPE=LC_ALL

rsync -av --delete react/build/ app/assets/build/

find app/assets/build -type f -exec sed -i'' -e 's|href="/|href="/calculate-ni/|g' -e 's|src="/|src="/calculate-ni/|g' '{}' \;

sed -i'' -e 's|": "/|": "/calculate-ni/|' app/assets/build/asset-manifest.json

sed -i'' -e 's|"static|"calculate-ni/static|g' app/assets/build/static/js/*.js

sed -i'' -e 's|url(/|url(/calculate-ni/|g' app/assets/build/static/css/*.css

