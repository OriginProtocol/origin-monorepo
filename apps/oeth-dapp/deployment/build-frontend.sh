#!/bin/sh
yarn install --frozen-lockfile
npx nx build oeth-dapp --prod
