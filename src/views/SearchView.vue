<script setup>
import Status from '../components/Status.vue'
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'

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
  let route = useRoute()
  loadSearchData(route.params.label)
})

async function loadSearchData(label, after) {
  loading.value = true
  try {
    let resp = await proxy.$lln.status.search({
      type: 'label',
      value: label,
      after: after,
      size: 12,
      session: session.value
    })
    if (resp.headers.get("X-Session-Valid") == "false") {
      session.value = null
    }
    haveMore.value = resp.more
    if (resp.v) {
      for (let s of resp.v) {
        status.value.push(s)
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
    <Title :title="$t('nav.searchresult')" backbtn="true" />
    <ul v-if="status">
      <li v-for="s in status" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status @shouldLogin="$emit('shouldLogin')" :status="s" />
      </li>
    </ul>
    <div class="loadbtn" v-if="haveMore && !loading"
      @click="loadSearchData($route.params.label, status[status.length - 1].id)">
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