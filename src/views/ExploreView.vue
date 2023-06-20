<script setup>
import Status from '../components/Status.vue'
import Post from '../components/Post.vue'
import Title from '../components/Title.vue'
import Loadding from '../components/Loadding.vue'
import { ref, onMounted, inject } from 'vue'

const session = ref()
const status = ref()
let llnApi = ""

onMounted(async () => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
  await loadExploreData()
})

async function loadExploreData() {
  let opts = {}
  if (session.value) {
    opts.headers = {
      "Authorization": session.value.apiKey,
    }
  }
  let resp = await fetch(`${llnApi}/o/explore`, opts)
  if (resp.headers.get("X-Session-Valid") == "false") {
    session.value = null
  }
  status.value = await resp.json()
  if (status.value == null) {
    status.value = []
  }
}

</script>
<template>
  <main>
    <Title :title="session ? $t('nav.home') : $t('nav.explore')" />
    <Post v-if="session" @posted="loadExploreData" :placeholder="$t('status.prompt')" :btntext="$t('status.post')" />
    <ul v-if="status">
      <li v-for="s in status" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status @shouldLogin="$emit('shouldLogin')" :status="s" />
      </li>
    </ul>
    <Loadding v-if="!status" />
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
</style>