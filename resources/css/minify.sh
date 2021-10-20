#!/bin/bash

if [ -z "$1" ]; then
  echo "No argument supplied"
	exit 1;
fi

if [ ! -f "$1" ]; then
  echo "File does not exist"
  exit 1;
fi

file=$(basename -- "$1")
filename="${file%.*}"
extension="${file##*.}"
filenameMin="$filename.min.$extension"

echo "file: $file, filename: $filename, extension: $extension, filename min: $filenameMin"

yui-compressor --type css --charset utf-8 -v -o "$filenameMin" "$file"

integrity=`cat $filenameMin | openssl dgst -sha384 -binary | openssl enc -base64 -A`
echo "Integrity sha384-$integrity"
