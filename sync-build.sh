#!/usr/bin/env bash

export LC_CTYPE=LC_ALL

rm app/assets/precache-manifest.*
rm -rf app/assets/static
rsync -av react/build/ app/assets/
