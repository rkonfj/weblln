<script setup>
import Title from '../components/Title.vue'
import Status from '../components/Status.vue'
import Loadding from '../components/Loadding.vue'

import NoBookmarkIcon from '../components/icons/IconNoBookmark.vue'
import { ref, onMounted } from 'vue'
const bookmarks = ref()
const session = ref()

onMounted(async () => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  if (!session.value) {
    $router.push('/')
    return
  }
  let resp = await fetch('https://api.lowlevelnews.com/i/bookmarks', {
    headers: {
      "Authorization": session.value.apiKey,
    }
  })
  if (resp.headers.get("X-Session-Valid") == "false") {
    session.value = null
    $emit('shouldLogin')
    return
  }
  bookmarks.value = await resp.json()
  if (bookmarks.value == null) {
    bookmarks.value = []
  }
})
</script>
<template>
  <main>
    <Title :title="$t('nav.bookmarks')" />
    <ul v-if="bookmarks">
      <li v-for="s in bookmarks" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status @shouldLogin="$emit('shouldLogin')" :status="s" />
      </li>
    </ul>
    <div v-if="bookmarks && bookmarks.length == 0" class="empty">
      <NoBookmarkIcon />
    </div>
    <Loadding v-if="!bookmarks" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}

main ul li {
  display: flex;
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid rgb(239, 243, 244);
}

main ul li:hover {
  background-color: rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
}
</style>