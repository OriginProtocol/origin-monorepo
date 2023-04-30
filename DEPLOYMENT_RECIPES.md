# Deployment Receipe Information

## NextJs dApp

The following outlines the basis for deploying a NextJs app within the context of the `nx` monorepo.

Heroku Environment
---------------

### Add Buildpacks for dApp

- `heroku/nodejs`
- `https://github.com/polkamon/heroku-buildpack-nx-monorepo`

### Usage
1. Add a Procfile to the root dir of the app that shall be deployed.
2. Create a heroku app.
3. Add the relative path to your app env config `APP_BASE=relative/path/to/app/root`, e.g, `APP_BASE=./apps/oeth-dapp`
4. Add a `PROJECT_NAME` that signifies what to look for as far as the change set, e.g, `oeth-dapp`
5. Add the NodeJs Buildpack as it is needed by Nx and most likely the app does need it as well.
6. Add this buildpack heroku buildpacks:add -a <app> https://github.com/polkemon/heroku-buildpack-nx-monorepo
7. Connect your Git Monorepo (or push it manually).
8. Build and check the result.
