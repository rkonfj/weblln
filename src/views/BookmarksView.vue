<script setup>
import Title from '../components/Title.vue'
import Status from '../components/Status.vue'
import Loading from '../components/Loading.vue'

import NoBookmarkIcon from '../components/icons/IconNoBookmark.vue'
import { ref, onMounted, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const bookmarks = ref([])
const session = ref()
const loading = ref(true)
const haveMore = ref()

onMounted(async () => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  if (!session.value) {
    proxy.$router.push('/')
    return
  }
  loadBookmarks()
})

async function loadBookmarks(after) {
  loading.value = true
  try {
    let resp = await proxy.$lln.user.bookmarks(after, 12, session.value)
    haveMore.value = resp.more
    let ss = resp.v
    if (ss != null) {
      for (let s of ss) {
        bookmarks.value.push(s)
      }
    }
  } catch (e) {
    if (e.code == 401) {
      proxy.$router.push('/')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
  loading.value = false
}
</script>
<template>
  <main>
    <Title :title="$t('nav.bookmarks')" />
    <ul>
      <li v-for="(s, i) in bookmarks" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status @shouldLogin="$emit('shouldLogin')" :key="s.id" @deleted="bookmarks.splice(i, 1)" :status="s" />
      </li>
    </ul>
    <div v-if="!loading && bookmarks.length == 0" class="empty">
      <NoBookmarkIcon />
    </div>
    <div class="loadbtn" v-if="bookmarks.length > 0 && haveMore && !loading"
      @click="loadBookmarks(bookmarks[bookmarks.length - 1].createRev)">
      加载更多
    </div>
    <Loading v-if="loading" />
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

@media (max-width: 60rem) {
  main ul li:hover {
    background-color: unset;
  }
}
</style>