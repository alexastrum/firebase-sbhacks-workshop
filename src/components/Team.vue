<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">
        {{ team.data.name }}
        <q-btn
          unelevated
          v-if="currentUserTeam !== team.id"
          label="Join"
          @click="joinTeam(team.id)"
        />
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <avatar-component
        class="q-mr-sm"
        v-for="user in users"
        :key="user.id"
        :user="user.data"
      >
      </avatar-component>
      <div v-if="!users.length">
        There is no one in this team.
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { firebaseService } from 'src/firebase-service'
import { FirestoreDocResult } from 'src/firebase-vue'
import { Team } from 'src/models'
import AvatarComponent from './Avatar.vue'

type TeamParam = FirestoreDocResult<Team>;

export default defineComponent({
  name: 'Team',
  components: { AvatarComponent },
  props: {
    currentUserTeam: String,
    team: {
      type: Object,
      required: true
    }
  },
  setup (props: { team: TeamParam }) {
    return {
      users: computed(() => firebaseService.users.value?.filter(user => user.data.team === props.team.id) || []),
      joinTeam: (teamId: string) => firebaseService.joinTeam(teamId)
    }
  }
})
</script>
