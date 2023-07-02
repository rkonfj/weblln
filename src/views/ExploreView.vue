<script setup>
import Status from '../components/Status.vue'
import Post from '../components/Post.vue'
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import { ref, onMounted, inject, nextTick, getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const session = ref()
const status = ref([])
const loading = ref(true)
const haveMore = ref()

onMounted(async () => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  await loadExploreData()
})

async function loadExploreData(after) {
  loading.value = true
  try {
    let resp = await proxy.$lln.status.explore(after, 15, session.value)
    if (resp.headers.get("X-Session-Valid") == "false") {
      session.value = null
    }
    haveMore.value = resp.more
    if (resp.v) {
      if (!after) {
        status.value = resp.v
      } else {
        for (let s of resp.v) {
          status.value.push(s)
        }
      }
    }
  } catch (e) {
    proxy.$toast(e.message, { type: 'error' })
  }
  loading.value = false
}
</script>
<template>
  <main>
    <Title :title="session ? $t('nav.home') : $t('nav.explore')" />
    <Post v-if="session" @posted="loadExploreData" :placeholder="$t('status.prompt')" :btntext="$t('status.post')" />
    <ul>
      <div v-for="(s, i) in status">
        <li @click="$router.push(`/${s.prev.user.uniqueName}/status/${s.prev.id}`)" v-if="s.prev"
          style="border-bottom: none;">
          <Status @shouldLogin="$emit('shouldLogin')" :key="s.prev.id" :timeline="true" :status="s.prev" />
        </li>
        <li @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
          <Status @shouldLogin="$emit('shouldLogin')" :key="s.id" @deleted="status.splice(i, 1)" :status="s" />
        </li>
      </div>
    </ul>
    <div class="loadbtn" v-if="haveMore && !loading" @click="loadExploreData(status[status.length - 1].id)">
      {{ $t('nav.showmore') }}
    </div>
    <Loading v-if="loading" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid var(--lln-color-border);
  border-right: 1px solid var(--lln-color-border);
}

main .loadbtn,
main ul li {
  display: flex;
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid var(--lln-color-border);
}

main .loadbtn:hover,
main ul li:hover {
  background-color: var(--lln-color-bg-hover);
  cursor: pointer;
}

main .loadbtn {
  justify-content: center;
  align-items: center;
  color: hsla(160, 100%, 37%, 1);
}

@media (max-width: 60rem) {
  main ul li:hover {
    background-color: unset;
  }
}
</style>
