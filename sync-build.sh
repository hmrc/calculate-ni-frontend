#!/usr/bin/env bash

export LC_CTYPE=LC_ALL

rsync -av react/build/ app/assets/

sed -i'' -e 's|href="/|href="/calculate-ni/|g' -e 's|src="/|src="/calculate-ni/|g' app/assets/index.html

sed -i'' -e 's|": "/|": "/calculate-ni/|' app/assets/asset-manifest.json

sed -i'' -e 's|"static|"calculate-ni/static|g' app/assets/static/js/*.js

sed -i'' -e 's|url(/|url(/calculate-ni/|g' app/assets/static/css/*.css

