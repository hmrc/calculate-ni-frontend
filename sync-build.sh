#!/usr/bin/env bash

export LC_CTYPE=LC_ALL

rm app/assets/precache-manifest.*
rm -rf app/assets/static
rsync -av react/build/ app/assets/

sed -i'' -e 's|href="/|href="/calculate-ni/|g' -e 's|src="/|src="/calculate-ni/|g' app/assets/index.html

sed -i'' -e 's|": "/|": "/calculate-ni/|' app/assets/asset-manifest.json

sed -i'' -e 's|"static|"calculate-ni/static|g' app/assets/static/js/*.js

sed -i'' -e 's|url(/|url(/calculate-ni/|g' app/assets/static/css/*.css

