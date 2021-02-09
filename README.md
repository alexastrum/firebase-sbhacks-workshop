# Firebase SBHacks Workshop

Buld and deploy a production ready app with Firebase and Quasar/Vue.js in 30 minutes.

## Getting started on your local machine (recommended)

To get the source code, run the following from your cmd line terminal:

```bash
git clone https://github.com/alexastrum/firebase-sbhacks-workshop.git
cd firebase-sbhacks-workshop
```

**We'll run all commands below from the project's root dir.**

### Install the dependencies

You'll need a stable [Node JS](https://nodejs.org) Long Term Support version (e.g 12, 14, ...).
Make sure you can run `node` commands from any folder in your Terminal.

```bash
npm install -g firebase-tools
npm install -g @quasar/cli
npm install
```

### Configure Firebase

Authenticate your Firebase CLI.

```bash
firebase login
```

Create a Firebase project, or select an existing one ().

```bash
firebase use --add
```

- In the [Firebase console](https://console.firebase.google.com), click the cog icon next to *Project Overview* then open **Project settings**.
- Scroll down to the *You apps* section, click on **Config** radio button in the *Firebase SDK Snippet* subsection for you app.

Copy-paste you app's `firebaseConfig` to `src/config/firebase.ts`, replacing the exisign `firebaseConfig` object.
Do not remove the export line.
You can find more info about the config object in the [official docs](https://firebase.google.com/docs/web/setup?authuser=0#config-object).

```bash
firebase login
firebase use --add
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Deploy the app to Firebase Hosting

To deploy to Firebase Hosting, you'll use the Firebase CLI, a command-line tool:

```bash
quasar build
firebase deploy
```

## Implement your features

During this workshop we will only write Firebase specific logic.

### 1. Firebase Auth with Google

Enable Google Sign-In in the Firebase console:

- In the [Firebase console](https://console.firebase.google.com), open the **Auth** section.
- On the **Sign in method** tab, enable the **Google** sign-in method and click **Save**.

---

Open `src/firebase-service.ts` in VS Code.

Update `FirebaseService` to contain:

```ts
class FirebaseService {
  // Firebase Auth state.
  private readonly auth = useFirebaseAuth();

  // Compute user data, when the user is signed in.
  readonly currentUser = computed<User | null>(
    () =>
      this.auth.currentUser && {
        name: this.auth.currentUser.displayName || "",
        photoURL: this.auth.currentUser.photoURL || "",
        team: ""
      }
  );

  // Display the spinner until Firebase Auth is fully initialized.
  readonly ready = computed(() => this.auth.ready);

  //...
}
```

Vue.js is a reactive framework. Our `firebase-vue` utilities return reactive object references.
But any derived values would need to be wrapped in [computed](https://v3.vuejs.org/guide/reactivity-computed-watchers.html#computed-values) calls.

Add any missing imports. Remember to include:

```ts
import "firebase/auth";
```

Implement Firebase with Google Auth logic inside the `signIn()` method:

```ts
const provider = new firebase.auth.GoogleAuthProvider();
await firebase.auth().signInWithPopup(provider);
```

Test the new sign in functionality.

---

Implement `signOut()` method:

```ts
await firebase.auth().signOut(provider);
```

Test the new sign out functionality.

### 2. Firestore for user data

Create a [Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart#create) in **Test mode**.

Update `FirebaseService` to contain:

```ts
class FirebaseService {
  // The collection with user data, keyed by uid.
  private readonly usersCollection = firebase
    .firestore()
    .collection("users") as firebase.firestore.CollectionReference<User>;

  // Firebase Auth state.
  private readonly auth = useFirebaseAuth<User>({
    // Fetch or create user data, after sign in.
    dataCollection: this.usersCollection,
    dataGetter: user => ({
      name: user.displayName || "Anonymous",
      photoURL: user.photoURL || "",
      team: ""
    })
  });

  // Display current user data once loaded.
  readonly currentUser = computed(() => this.auth.currentUserData);

  //...
}
```

Refresh the **Cloud Firestore** page. A new entry for your user should be visible.

### 3. Firestore for associated users with team

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

## Thanks for checking out this workshop

I plan to contribute more materials on Firebase integrations.

I'd also love to hear your feedback!

Best,
Alex
