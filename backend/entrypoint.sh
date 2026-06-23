#!/bin/sh

set -e

echo "Wating for databse..."
flask db upgrade

echo "Starting Gunicorn..."
exec gunicorn --bind 0.0.0.0:5000 --workers 2 run:app