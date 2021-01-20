import { computed, ref } from '@vue/composition-api'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import firebaseConfig from './config/firebase'
import { useFirebase, useFirebaseAuth, useFirestoreQuery } from './firebase-vue'
import { User } from './models'

class FirebaseService {
  // The collection with user data, keyed by uid.
  private readonly usersCollection = firebase.firestore().collection('users') as firebase.firestore.CollectionReference<User>;

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

  // Display the spinner until Firebase Auth is initialized and the user data is loaded.
  readonly ready = computed(() => this.auth.ready)

  // List all user profiles.
  readonly users = useFirestoreQuery(() => this.auth.signedIn ? this.usersCollection : null);

  readonly teams = ref([]);

  async signIn () {
    console.log('Logging in...')
    const provider = new firebase.auth.GoogleAuthProvider()
    await firebase.auth().signInWithPopup(provider)
    console.log('Done logging in')
  }

  async signOut () {
    console.log('Logging out...')
    await firebase.auth().signOut()
    console.log('Done logging out')
  }

  createTeam (teamName: string) {
    console.log(`Creating team ${teamName}...`)
    throw new Error('Not implemented')
  }

  joinTeam (teamId: string) {
    console.log(`Joining team with id ${teamId}...`)
    throw new Error('Not implemented')
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
useFirebase({ firebaseConfig })

export const firebaseService = new FirebaseService()
