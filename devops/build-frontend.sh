#!/bin/sh
yarn install --frozen-lockfile
npx nx build $APP_ID --prod
