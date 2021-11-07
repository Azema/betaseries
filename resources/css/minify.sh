#!/bin/bash

if [ -z "$1" ]; then
  echo "No argument supplied"
	exit 1;
fi

if [ ! -f "$1.css" ]; then
  echo "File does not exist"
  exit 1;
fi

file=$(basename -- "$1.css")
filename="${file%.*}"
extension="${file##*.}"
filenameMin="$filename.min.$extension"
compressor="/usr/bin/yui-compressor"
if [ ! -f "$compressor" ]; then
  compressor="./yui-compressor";
fi

echo "file: $file, filename: $filename, extension: $extension, filename min: $filenameMin"

$compressor --type css --charset utf-8 -v -o "$filenameMin" "$file"

integrity=`cat $filenameMin | openssl dgst -sha384 -binary | openssl enc -base64 -A`
echo "Integrity sha384-$integrity"
