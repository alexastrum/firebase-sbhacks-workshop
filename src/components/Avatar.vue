<template>
  <q-avatar>
    <q-tooltip>
      {{user.name}}
    </q-tooltip>
    <img
      v-if="user.photoURL"
      :src="user.photoURL"
    >
    <template v-else>
      {{user.name.substr(0, 2)}}
    </template>
  </q-avatar>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'Avatar',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup () {
    return {}
  }
})
</script>
