<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Firebase SBHacks Workshop
        </q-toolbar-title>

        <div v-if="currentUser">
          <q-btn flat label="Sign out" @click="signOut()" />
          <q-avatar v-if="currentUser.photoURL">
            <img :src="currentUser.photoURL">
          </q-avatar>
        </div>
        <div v-else>
          <q-btn flat label="Sign in with Google" @click="signIn()" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Essential Links
        </q-item-label>
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page v-if="!ready" class="row items-center justify-center">
        <q-spinner size="100" />
      </q-page>
      <router-view ng-if="ready && currentUser" />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import EssentialLink from 'components/EssentialLink.vue'

const linksData = [
  {
    title: 'Github',
    caption: 'github.com/alexastrum/firebase-sbhacks-workshop',
    icon: 'code',
    link: 'https://github.com/alexastrum/firebase-vue-sbhacks-workshop'
  },
  {
    title: 'Firebase Docs',
    caption: 'The serverless secret sause',
    icon: 'school',
    link: 'https://firebase.google.com/'
  },
  {
    title: 'Vuejs Docs',
    caption: 'The web app secret sauce',
    icon: 'school',
    link: 'https://v3.vuejs.org/guide'
  },
  {
    title: 'Quasar Docs',
    caption: 'Cross-platform Material Design framework',
    icon: 'school',
    link: 'https://quasar.dev'
  },
  {
    title: 'SBHacks VII',
    caption: 'Hackathon official website',
    icon: 'favorite',
    link: 'https://sbhacks.com/'
  }
]

import { defineComponent, ref } from '@vue/composition-api'
import { useFirebase } from '../firebase'

export default defineComponent({
  name: 'MainLayout',
  components: { EssentialLink },
  setup () {
    const leftDrawerOpen = ref(false)
    const essentialLinks = ref(linksData)
    const {signIn, signOut, ready, currentUser} = useFirebase();
    return { leftDrawerOpen, essentialLinks, ready, currentUser, signIn, signOut}
  }
})
</script>
