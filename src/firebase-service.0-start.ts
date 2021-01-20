import { ref } from '@vue/composition-api'

class FirebaseService {
  readonly currentUser = ref(null);

  readonly ready = ref(true);

  readonly users = ref([]);

  readonly teams = ref([]);

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
