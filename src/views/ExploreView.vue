<script setup>
import Status from '../components/Status.vue'
import Post from '../components/Post.vue'
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import { ref, onMounted, getCurrentInstance, onActivated, onDeactivated } from 'vue'

const { proxy } = getCurrentInstance()
const session = ref()
const status = ref([])
const loading = ref(true)
const loadingNews = ref()
const haveMore = ref()
const news = ref(0)
let newsProbeInterval = null

onMounted(async () => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  if (status.value.length > 0) {
    return
  }
  await loadExploreData()
})

onActivated(async () => {
  newsProbe()
  if (!newsProbeInterval) {
    newsProbeInterval = setInterval(newsProbe, 15000)
  }
})

onDeactivated(() => {
  if (newsProbeInterval) {
    clearInterval(newsProbeInterval)
    newsProbeInterval = null
  }
})

async function loadExploreData(opts) {
  if (!opts) {
    opts = {}
  }
  if (!opts.size) {
    opts.size = 15
  }
  loading.value = true
  try {
    let resp = await proxy.$lln.status.explore(opts, session.value)
    if (resp.headers.get("X-Session-Valid") == "false") {
      session.value = null
    }
    haveMore.value = resp.more
    if (resp.v) {
      if (!opts.after) {
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

async function newsProbe() {
  if (status.value.length > 0) {
    try {
      let resp = await proxy.$lln.status.newsProbe(status.value[0].createRev, session.value)
      news.value = resp.v
    } catch (e) {
      console.error('explore news probe error: ', e.message)
    }
  }
}

async function loadNewStatus() {
  loadingNews.value = true
  try {
    let resp = await proxy.$lln.status.explore({
      after: status.value[0].createRev,
      size: 15,
      order: 'asc'
    }, session.value)
    if (resp.headers.get("X-Session-Valid") == "false") {
      session.value = null
    }
    if (resp.v) {
      const removeList = []
      for (let s of resp.v) {
        status.value.unshift(s)
        if (s.prev) {
          removeList.push(s.prev.id)
        }
      }

      // remove linked status
      let i = status.value.length
      while(i--) {
        let s = status.value[i]
        if (removeList.includes(s.id)) {
          status.value.splice(i, 1)
        }
      }
    }
    news.value = 0
  } catch (e) {
    proxy.$toast(e.message, { type: 'error' })
  }
  loadingNews.value = false
}
</script>
<template>
  <main>
    <Title :title="session ? $t('nav.home') : $t('nav.explore')" />
    <Post v-if="session" @posted="loadNewStatus" :placeholder="$t('status.prompt')" :btntext="$t('status.post')" />
    <a v-if="!loadingNews && news > 0" class="loadNewStatus" @click="loadNewStatus">{{ $t('btn.show') }}<span>{{ news
    }}</span>{{ $t('tips.tweets') }}</a>
    <Loading v-if="loadingNews" />
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
    <div class="loadbtn" v-if="haveMore && !loading"
      @click="loadExploreData({ after: status[status.length - 1].createRev })">
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

main .loadNewStatus {
  cursor: pointer;
  justify-content: center;
}

main .loadNewStatus span {
  margin: 0 3px;
}

main .loadNewStatus:hover {
  background-color: var(--lln-color-bg-hover);
}

main .loadNewStatus,
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
