import './firebase-config'
import { Team, User } from './components/models'

const firebaseState = (() => {
  return {
    signIn: () => {
      return undefined
    },
    signOut: () => {
      return undefined
    },
    ready: true,
    currentUser: undefined,
    users: [] as User[],

    createTeam: (teamName: string) => {
      console.log('Creating team...', teamName)
      return undefined
    },
    joinTeam: (teamId: string) => {
      console.log('Joining team...', teamId)
      return undefined
    },
    teams: [] as Team[]
  }
})()

export function useFirebase () {
  return firebaseState
}
