<script setup>
import Status from '../components/Status.vue'
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'

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
  let route = useRoute()
  loadSearchData(route.params.label)
})

async function loadSearchData(label, after) {
  loading.value = true
  let opts = {}
  if (session.value) {
    opts.headers = {
      "Authorization": session.value.apiKey,
    }
  }
  let afterQuery = ''
  if (after) {
    afterQuery = '&after=' + after
  }
  let resp = await fetch(`${llnApi}/o/search?type=label&value=${label}&size=12${afterQuery}`, opts)
  if (resp.headers.get("X-Session-Valid") == "false") {
    session.value = null
  }
  let ss = await resp.json()
  if (!after) {
    status.value = []
    if (ss != null) {
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
    <Title :title="$t('nav.searchresult')"  backbtn="true" />
    <ul v-if="status">
      <li v-for="s in status" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status @shouldLogin="$emit('shouldLogin')" :status="s" />
      </li>
    </ul>
    <div class="loadbtn" v-if="status && status.length > 0 && status.length % 12 == 0 && haveMore && !loading"
      @click="loadSearchData($route.params.label, status[status.length - 1].id)">
      {{ $t('nav.showmore') }}
    </div>
    <Loading v-if="!status || loading" />
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
  color: hsla(160, 100%, 37%, 1);
}
</style>