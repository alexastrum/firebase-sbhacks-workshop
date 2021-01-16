<template>
  <q-page class="column items-center justify-center">
    <template>
      <div>
        <team-component
          :currentUserTeam="currentUser.team"
          :team="team" v-for="team in teams" 
          :key="team.id"></team-component>
      </div>
      <q-input outlined v-model="teamName" label="Create new team">
        <template v-slot:append>
          <q-btn round dense flat icon="add" @click="createTeam(teamName)" />
        </template>
      </q-input>
    </template>
  </q-page>
</template>

<script lang="ts">
import TeamComponent from 'components/Team.vue'
import { computed, defineComponent, ref } from '@vue/composition-api'
import { useFirebase } from 'src/firebase'

export default defineComponent({
  name: 'PageIndex',
  components: { TeamComponent },
  setup () {
    const teamName = ref('')
    const {currentUser, teams, createTeam} = useFirebase();
    return {
      currentUser,
      teams,
      teamName,
      createTeam
    }
  }
})
</script>
