#!/bin/sh
yarn install --frozen-lockfile
npx nx build $PROJECT_NAME --prod
