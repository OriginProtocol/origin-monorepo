#!/bin/sh
yarn install --frozen-lockfile
npx nx build ousd-dapp --prod
