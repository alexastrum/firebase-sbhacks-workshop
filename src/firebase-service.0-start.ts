import { ref } from '@vue/composition-api'
import { Team, User } from './models'
import { FirestoreQueryDoc } from './firebase-vue'

class FirebaseService {
  readonly currentUser = ref<User | null>(null);

  readonly ready = ref(true);

  readonly users = ref<FirestoreQueryDoc<User>[]>([]);

  readonly teams = ref<FirestoreQueryDoc<Team>[]>([]);

  signIn () {
    console.log('Logging in...')
    throw new Error('Not implemented')
  }

  signOut () {
    console.log('Logging out...')
    throw new Error('Not implemented')
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

export const firebaseService = new FirebaseService()
