<script setup>
import Title from '../components/Title.vue'
import Status from '../components/Status.vue'
import Loadding from '../components/Loadding.vue'
import Post from '../components/Post.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const status = ref()
const session = ref()

onMounted(async () => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  let resp = await fetch(`https://api.lowlevelnews.com/o/status/${route.params.id}`)
  status.value = await resp.json()
})

</script>
<template>
  <main>
    <Title title="主题" :backbtn="true" />
    <div class="mainarea">
      <Status v-if="status" :status="status" />
    </div>
    <Post v-if="status && session" @posted="" placeholder="发布你的回复！" btntext="回复" :prevstatus="status.id" />
    <Loadding v-if="!status" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}

.mainarea {
  display: flex;
  padding: 10px 15px;
  border-bottom: 1px solid rgb(239, 243, 244);
}
</style>