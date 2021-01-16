
import { ref } from '@vue/composition-api'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import './firebase-config'
import { Team, User } from './components/models'

const firebaseState = (() => {
  const provider = new firebase.auth.GoogleAuthProvider()

  let currentUserRef: firebase.firestore.DocumentReference<User>|undefined
  const usersCollection = firebase.firestore().collection('users') as firebase.firestore.CollectionReference<User>
  const teamsCollection = firebase.firestore().collection('teams') as firebase.firestore.CollectionReference<Team>

  const ready = ref(false)
  const currentUser = ref<User>()
  const teams = ref<Team[]>([])
  const users = ref<User[]>([])

  firebase.auth().onAuthStateChanged(async (account) => {
    console.debug('Auth state changed', account)
    if (account) {
      currentUserRef = usersCollection.doc(account.uid)
      const currentUserDoc = await currentUserRef.get()
      if (currentUserDoc.exists) {
        // Load user profile
        currentUser.value = currentUserDoc.data() as User
      } else {
        // Create user profile
        currentUser.value = { uid: account.uid, name: account.displayName || 'Anonymous', photoURL: account.photoURL || '', team: '' }
        await currentUserRef.set(currentUser.value)
      }

      usersCollection.onSnapshot(snap => {
        console.log('Users collection changed')
        users.value = snap.docs.map(doc => doc.data())
      })

      teamsCollection.onSnapshot(snap => {
        console.log('Teams collection changed')
        teams.value = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      })
    } else {
      currentUser.value = currentUserRef = undefined
      users.value = teams.value = []
    }
    ready.value = true
  })

  return {
    signIn: async () => {
      console.log('Logging in...')
      await firebase.auth().signInWithPopup(provider)
    },
    signOut: async () => {
      console.log('Logging out...')
      await firebase.auth().signOut()
    },
    ready,
    currentUser,
    users,

    createTeam: async (teamName: string) => {
      if (!currentUser.value || !currentUserRef) {
        return
      }
      const teamRef = await teamsCollection.add({ name: teamName })
      currentUser.value.team = teamRef.id
      await currentUserRef.update({ team: teamRef.id })
    },
    joinTeam: async (teamId: string) => {
      if (!currentUser.value || !currentUserRef) {
        return
      }
      currentUser.value.team = teamId
      await currentUserRef.update({ team: teamId })
    },
    teams
  }
})()

export function useFirebase () {
  return firebaseState
}
