<script setup>
import Title from '../components/Title.vue'
import Status from '../components/Status.vue'
import Loadding from '../components/Loadding.vue'
import Post from '../components/Post.vue'
import BookmarkIcon from '../components/icons/IconBookmark.vue'
import BookmarkedIcon from '../components/icons/BookmarkIcon.vue'

import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const emit = defineEmits(['shouldLogin', 'imagesReady'])
const status = ref([])
const session = ref()
const comments = ref()
const loading = ref()
const haveMore = ref(true)
const bookmarked = ref()
let llnApi = ""

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
  fetch(`${llnApi}/o/status/${route.params.id}`)
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

async function loadComments(after) {
  loading.value = true
  let afterQuery = ''
  if (after) {
    afterQuery = '&after=' + after
  }
  let resp = await fetch(`${llnApi}/o/status/${route.params.id}/comments?size=12${afterQuery}`)
  let ss = await resp.json()
  if (!after) {
    if (ss == null) {
      comments.value = []
    } else {
      comments.value = []
      comments.value = ss
    }
  } else {
    if (ss != null) {
      for (let s of ss) {
        comments.value.push(s)
      }
    } else {
      haveMore.value = false
    }
  }
  loading.value = false
}

async function bookmark() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  let resp = await fetch(`${llnApi}/i/bookmark/status/${route.params.id}`, {
    method: 'post',
    headers: {
      "Authorization": session.value.apiKey,
    }
  })
  if (resp.status == 401) {
    session.value = null
    emit('shouldLogin')
    return
  }
  if (resp.status != 200) {
    alert(await resp.text())
    return
  }
  bookmarked.value = !bookmarked.value
}

function handleImagesReady(ctx) {
  emit('imagesReady', ctx)
}

</script>
<template>
  <main>
    <Title :title="$t('nav.thread')" :backbtn="true" />
    <ul class="status" v-if="status.length > 0">
      <li v-for="(s, index) in status" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status :status="s" @shouldLogin="$emit('shouldLogin')" @imagesReady="handleImagesReady"
          :timeline="index != status.length - 1" />
      </li>
    </ul>
    <div class="operate" v-if="session && status.length > 0">
      <a @click="bookmark" title="加入书签">
        <BookmarkIcon v-if="!bookmarked" />
        <BookmarkedIcon v-if="bookmarked" />
      </a>
    </div>
    <Post v-if="status.length > 0 && session" @posted="loadComments" :placeholder="$t('status.replyPrompt')"
      :btntext="$t('status.reply')" :prevstatus="status[status.length - 1].id" />
    <ul v-if="comments">
      <li v-for="s in comments" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status :status="s" @shouldLogin="$emit('shouldLogin')" />
      </li>
    </ul>
    <div class="loadbtn" v-if="comments && comments.length > 0 && comments.length % 12 == 0 && haveMore && !loading"
      @click="loadComments(comments[comments.length - 1].id)">
      加载更多
    </div>
    <Loadding v-if="status.length == 0 || !comments || loading" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
  background-color: #fff;
  z-index: 10000;
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

.operate {
  height: 50px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgb(239, 243, 244);
}

.operate a {
  display: flex;
  height: 42px;
  width: 42px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}


.operate svg {
  height: 22px;
  fill: rgb(83, 100, 113);
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