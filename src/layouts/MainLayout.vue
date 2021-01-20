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
        <div v-if="ready">
          <div v-if="currentUser">
            <q-btn
              flat
              label="Sign out"
              @click="signOut()"
            />
            <avatar :user="currentUser">
            </avatar>
          </div>
          <div v-else>
            <q-btn
              flat
              label="Sign in with Google"
              @click="signIn()"
            />
          </div>
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
        <sidebar-link
          v-for="link in links"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page
        v-if="!ready"
        class="row items-center justify-center"
      >
        <q-spinner size="100" />
      </q-page>
      <router-view v-else-if="currentUser" />
      <q-banner
        v-else
        rounded
        class="q-ma-md bg-orange text-white"
      >Sign in to use this app.</q-banner>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { firebaseService } from 'src/firebase-service'
import Avatar from 'src/components/Avatar.vue'
import SidebarLink from 'src/components/SidebarLink.vue'
import links from 'src/config/links'

export default defineComponent({
  name: 'MainLayout',
  components: { SidebarLink, Avatar },
  setup () {
    return {
      leftDrawerOpen: ref(false),
      links: ref(links),
      ready: firebaseService.ready,
      currentUser: firebaseService.currentUser,
      signIn: () => firebaseService.signIn(),
      signOut: () => firebaseService.signOut()
    }
  }
})
</script>
