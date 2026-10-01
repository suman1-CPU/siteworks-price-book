#!/bin/sh
# Wraps price_book.html (the page body) into a standalone index.html for GitHub Pages.
cd "$(dirname "$0")" || exit 1
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="description" content="Published UK gas and electricity siteworks prices: new connections, meter work and disconnections.">\n'
  cat price_book.html
  printf '\n</html>\n'
} > index.html
