<template>
  <q-page class="row items-center justify-evenly">
    <template>
  <div>
    <q-spinner v-if="!ready" size="100" />
    <div v-else-if="currentUser">
      <team-component :team="team" v-for="team in teams" :key="team.id"></team-component>
      <q-input outlined v-model="teamName" label="Create new team">
        <template v-slot:append>
          <q-btn round dense flat icon="add" @click="createTeam(teamName)" />
        </template>
      </q-input>
    </div>
  </div>
</template>
  </q-page>
</template>

<script lang="ts">
import TeamComponent from 'components/TeamComponent.vue'
import { defineComponent, ref } from '@vue/composition-api'
import { useFirebase } from 'src/firebase'

export default defineComponent({
  name: 'PageIndex',
  components: { TeamComponent },
  setup () {
    const teamName = ref('')
    return {
      teamName,
      ...useFirebase()
    }
  }
})
</script>
