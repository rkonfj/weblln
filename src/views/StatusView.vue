<script setup>
import Title from '../components/Title.vue'
import Status from '../components/Status.vue'
import Loadding from '../components/Loadding.vue'
import Post from '../components/Post.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const status = ref([])
const session = ref()
const comments = ref()

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  fetch(`https://api.lowlevelnews.com/o/status/${route.params.id}`)
    .then(async resp => {
      let s = await resp.json()
      let prev = s.prev
      s.prev = null
      status.value.unshift(s)
      while (prev != null) {
        let s = prev
        prev = prev.prev
        s.prev = null
        status.value.unshift(s)
      }
    })
  loadComments()
})

function loadComments() {
  fetch(`https://api.lowlevelnews.com/o/status/${route.params.id}/comments`)
    .then(async resp => {
      comments.value = await resp.json()
      if (comments.value == null) {
        comments.value = []
      }
    })
}

</script>
<template>
  <main>
    <Title title="主题" :backbtn="true" />
    <ul class="status" v-if="status.length > 0">
      <li v-for="s in status" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status :status="s" @shouldLogin="$emit('shouldLogin')" timeline="true" />
      </li>
    </ul>
    <Post v-if="status.length > 0 && session" @posted="loadComments" placeholder="发布你的回复！" btntext="回复"
      :prevstatus="status[status.length-1].id" />
    <ul v-if="comments">
      <li v-for="s in comments" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status :status="s" @shouldLogin="$emit('shouldLogin')" />
      </li>
    </ul>
    <Loadding v-if="status.length == 0 || !comments" />
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

.status {
  border-bottom: 1px solid rgb(239, 243, 244);
}
.status li {
  border-bottom: none;
}
.status li:last-child {
  background: none;
  cursor: auto;
}


</style>