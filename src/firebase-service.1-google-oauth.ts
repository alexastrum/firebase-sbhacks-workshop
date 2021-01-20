import { computed, ref } from '@vue/composition-api'
import firebase from 'firebase/app'
import 'firebase/auth'

import firebaseConfig from './config/firebase'
import { useFirebase, useFirebaseAuth } from './firebase-vue'
import { User } from './models'

class FirebaseService {
  // Firebase Auth state.
  private readonly auth = useFirebaseAuth();

  // Compute user data, when the user is signed in.
  readonly currentUser = computed<User | null>(() => (this.auth.currentUser && {
    name: this.auth.currentUser.displayName || '',
    photoURL: this.auth.currentUser.photoURL || '',
    team: ''
  }));

  // Display the spinner until Firebase Auth is fully initialized.
  readonly ready = computed(() => this.auth.ready)

  readonly users = ref([]);

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
