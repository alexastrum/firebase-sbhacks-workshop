<template>
  <q-card>
    <q-card-section>
      {{ team.name }}
      <q-btn v-if="currentUserTeam !== team.id" label="Join" @click="joinTeam(team.id)" />
    </q-card-section>
    <q-card-section>
      <div v-for="user in users" :key="user.uid">
        <div v-if="user.team === team.id">
          <q-avatar v-if="user.photoURL">
            <q-tooltip>
              {{user.name}}
            </q-tooltip>
            <img :src="user.photoURL">
          </q-avatar>
          <q-avatar v-else>
            <q-tooltip>
              {{user.name}}
            </q-tooltip>
            {{user.name.substr(0, 2)}}
          </q-avatar>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">

import { defineComponent } from '@vue/composition-api'
import { useFirebase } from '../firebase'
import { Team } from '../models'

export default defineComponent({
  name: 'Team',
  props: {
    currentUserTeam: String,
    team: Team
  },
  setup () {
    return {
      users: useFirebase().users,
      joinTeam: useFirebase().joinTeam
    }
  }
})
</script>
