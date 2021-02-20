# Firebase SBHacks Workshop

Buld and deploy a production ready app with Firebase and Quasar/Vue.js in 30 minutes.

## Getting started on your local machine (recommended)

To get the source code, run the following from your cmd line terminal:

```bash
git clone https://github.com/alexastrum/firebase-sbhacks-workshop.git
```

We'll run all commands below from the project's root dir.

```bash
cd firebase-sbhacks-workshop
```

### Install the dependencies

You'll need a stable [Node JS](https://nodejs.org) version (e.g 12, 14, ...).
If `firebase` or `quasar` tools give an error, you might need to upgrade or downgrade your node version.

Make sure you can run `node` commands from any folder in your Terminal.

Install the latest Firebase CLI tools:

```bash
npm install -g firebase-tools
```

Install the framework we'll use, Quasar:

```bash
npm install -g @quasar/cli
```
Install `yarn` – a faster node package manager:

```bash
npm install -g yarn
```
Then install project dependencies:

```bash
yarn
```

### Configure Firebase

Authenticate your Firebase CLI.

```bash
firebase login
```

Create a Firebase project, or select an existing one.

```bash
firebase use --add
```

- In the [Firebase console](https://console.firebase.google.com), click the cog icon next to *Project Overview* then open **Project settings**.
- Scroll down to the *You apps* section, click on **Config** radio button in the *Firebase SDK Snippet* subsection for you app.

Copy-paste you app's `firebaseConfig` to `src/config/firebase.ts`, replacing the existing `firebaseConfig` object.
Do not remove the export line.
You can find more info about the config object in the [official documentation](https://firebase.google.com/docs/web/setup?authuser=0#config-object).

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Deploy the app to Firebase Hosting

Build a production version of our app.

```bash
quasar build
```

To deploy to Firebase Hosting, you'll use the Firebase CLI, a command-line tool:

```bash
firebase deploy
```

## Implement your features

During this workshop we will only write Firebase specific logic.

### 1. Firebase Auth with Google

Enable Google Sign-In in the Firebase console:

- In the [Firebase console](https://console.firebase.google.com), open the **Auth** section.
- On the **Sign in method** tab, enable the **Google** sign-in method and click **Save**.

---

Open `src/firebase-service.ts` in your text editor.

I strongly recommend using Visual Studio Code.
I also recommend to install *recommended extensions for this repository* when prompted.

```ts
code .
```

Update `FirebaseService` replacing `currentUser` and `ready` properties with:

```ts
class FirebaseService {
  // Firebase Auth state.
  private readonly auth = useFirebaseAuth();

  // Compute user data, when the user is signed in.
  readonly currentUser = computed<User | null>(
    () =>
      this.auth.currentUser && {
        name: this.auth.currentUser.displayName || '',
        photoURL: this.auth.currentUser.photoURL || '',
        team: ''
      }
  );

  // Display the spinner until Firebase Auth is fully initialized.
  readonly ready = computed(() => this.auth.ready);

  //...
}
```

Vue.js is a reactive framework. Our `firebase-vue` utilities return reactive object references.
However any derived values would need to be wrapped in [computed](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#computed-values) calls.

Add any missing imports. Remember to include:

```ts
import 'firebase/auth';
import {useFirebaseAuth} from './firebase-vue';
```

Implement Firebase with Google Auth logic inside the `signIn()` method:

```ts
const provider = new firebase.auth.GoogleAuthProvider();
await firebase.auth().signInWithPopup(provider);
```

Make sure you didn't introduce any errors.

Test the new sign in functionality.

---

Implement `signOut()` method:

```ts
await firebase.auth().signOut(provider);
```

Test the new sign out functionality.

### 2. Firestore for user data

Create a [Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart#create) in **Test mode**.

Update `FirebaseService` replacing `auth`, `currentUser`, and `users` properties with:

```ts
class FirebaseService {
  // The collection with user data, keyed by uid.
  private readonly usersCollection = firebase
    .firestore()
    .collection('users') as firebase.firestore.CollectionReference<User>;

  // Firebase Auth state.
  private readonly auth = useFirebaseAuth<User>({
    // Fetch or create user data, after sign in.
    dataCollection: this.usersCollection,
    dataGetter: user => ({
      name: user.displayName || 'Anonymous',
      photoURL: user.photoURL || '',
      team: ''
    })
  });

  // Display current user data once loaded.
  readonly currentUser = computed(() => this.auth.currentUserData);

  //...
  
  // List all user profiles.
  readonly users = useFirestoreQuery(() => this.auth.signedIn ? this.usersCollection : null);

  //...
}
```
Add any missing imports. Remember to include:

```ts
import 'firebase/firestore';
import {useFirestoreQuery} from './firebase-vue';
```

Refresh the **Cloud Firestore** page. A new entry for your user should be visible.

### 3. Firestore for associated users with team

Update `FirebaseService` replacing `teams` property with:

```ts
class FirebaseService {
  //...

  private readonly teamsCollection = firebase.firestore().collection('teams') as firebase.firestore.CollectionReference<Team>;
  
  readonly teams = useFirestoreQuery(() => this.auth.signedIn ? this.teamsCollection : null);

  //...
}
```

Implement `joinTeam()` method:

```ts
const { currentUser } = firebase.auth();
if (!currentUser) {
  return;
}
await this.usersCollection.doc(currentUser.uid).update({ team: teamId });
```

Implement `createTeam()` method:

```ts
const teamRef = await this.teamsCollection.add({ name: teamName });
await this.joinTeam(teamRef.id);
```

Test the new sign out functionality.

Refresh the **Cloud Firestore** page. The teams you created should be visible.

You might also redeploy the production version of the app.

```bash
quasar build
firebase deploy
```

## Thanks for checking out this workshop

I plan to contribute more materials on Firebase integrations.

I'd also love to hear your feedback!

Best,
Alex
