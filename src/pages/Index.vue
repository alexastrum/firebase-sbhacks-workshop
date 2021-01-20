<template>
  <div>
    <team-component
      class="q-ma-md"
      :currentUserTeam="currentUserTeam"
      :team="team"
      v-for="team in teams || []"
      :key="team.id"
    ></team-component>
    <q-input
      class="q-ma-md"
      outlined
      v-model="teamName"
      label="Create new team"
    >
      <template v-slot:append>
        <q-btn
          round
          dense
          flat
          icon="add"
          @click="createTeam(teamName)"
        />
      </template>
    </q-input>
  </div>
</template>

<script lang="ts">
import TeamComponent from 'components/Team.vue'
import { computed, defineComponent, ref } from '@vue/composition-api'
import { firebaseService } from 'src/firebase-service'

export default defineComponent({
  name: 'PageIndex',
  components: {
    TeamComponent
  },
  setup () {
    return {
      currentUserTeam: computed(() => firebaseService.currentUser.value?.team),
      teams: firebaseService.teams,
      teamName: ref(''),
      createTeam: (teamName: string) => firebaseService.createTeam(teamName)
    }
  }
})
</script>
