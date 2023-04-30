#!/bin/sh
export NODE_ENV=production;
next start ./dist/apps/$PROJECT_NAME/ --port=$PORT
