# Firebase SBHacks Workshop (firebase-vue-sbhacks-workshop)

Bulding and deploying a production grade app with Firebase in 30 minutes

## Getting started on your local machine (recommended)

## Install the dependencies

```bash
npm install -g firebase-tools
npm install
firebase login
firebase use --add --alias default
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files (to catch bugs and keep the code readable)

```bash
npm run lint
```

### Deploy the app in production

```bash
quasar build
firebase deploy
```

### Customize the configuration

See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
