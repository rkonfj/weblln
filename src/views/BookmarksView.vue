<script setup>
import Title from '../components/Title.vue'
import Status from '../components/Status.vue'
import Loading from '../components/Loading.vue'

import NoBookmarkIcon from '../components/icons/IconNoBookmark.vue'
import { ref, onMounted, inject } from 'vue'
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
  let resp = await fetch(`${inject('llnApi')}/i/bookmarks`, {
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
    <Loading v-if="!bookmarks" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid var(--lln-color-border);
  border-right: 1px solid var(--lln-color-border);
}

main ul li {
  display: flex;
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid var(--lln-color-border);
}

main ul li:hover {
  background-color: var(--lln-color-bg-hover);
  cursor: pointer;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
}
</style>