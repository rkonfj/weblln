<script setup>
import Status from '../components/Status.vue'
import Post from '../components/Post.vue'
import Title from '../components/Title.vue'
import Loadding from '../components/Loadding.vue'
import { ref, onMounted, inject } from 'vue'

const session = ref()
const status = ref()
const loading = ref()
const haveMore = ref(true)
let llnApi = ""

onMounted(async () => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
  await loadExploreData()
})

async function loadExploreData(after) {
  loading.value = true
  let opts = {}
  if (session.value) {
    opts.headers = {
      "Authorization": session.value.apiKey,
    }
  }
  let afterQuery = ''
  if (after) {
    afterQuery = '?after=' + after
  }
  let resp = await fetch(`${llnApi}/o/explore${afterQuery}`, opts)
  if (resp.headers.get("X-Session-Valid") == "false") {
    session.value = null
  }
  let ss = await resp.json()
  if (!after) {
    if (ss == null) {
      status.value = []
    } else {
      status.value = []
      status.value = ss
    }
  } else {
    if (ss != null) {
      for (let s of ss) {
        status.value.push(s)
      }
    } else {
      haveMore.value = false
    }
  }
  loading.value = false
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
    <div class="loadbtn" v-if="status && status.length%20 == 0 && haveMore" @click="loadExploreData(status[status.length - 1].id)">加载更多
    </div>
    <Loadding v-if="!status || loading" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}

main .loadbtn,
main ul li {
  display: flex;
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid rgb(239, 243, 244);
}

main .loadbtn:hover,
main ul li:hover {
  background-color: rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

main .loadbtn {
  justify-content: center;
  align-items: center;
}
</style>