# Firebase SBHacks Workshop (firebase-vue-sbhacks-workshop)

Bulding and deploying a production grade app with Firebase and Quasar/Vue.js in 30 minutes

## Getting started on your local machine (recommended)

## Install the dependencies

```bash
npm install -g firebase-tools
npm install -g @quasar/cli
npm install
```

### Configure Firebase

Create a Firebase project and a web app,
copy-paste you specific `firebaseConfig` to `src/firebase-config.ts`,
then run the following commands and select the project you just created.

```bash
firebase login
firebase use --add
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
