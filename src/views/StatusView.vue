<script setup>
import Title from '../components/Title.vue'
import Status from '../components/Status.vue'
import Loading from '../components/Loading.vue'
import Post from '../components/Post.vue'
import CommentIcon from '../components/icons/IconComment.vue'
import LikeIcon from '../components/icons/IconLike.vue'
import LikedIcon from '../components/icons/LikedIcon.vue'
import BookmarkIcon from '../components/icons/IconBookmark.vue'
import BookmarkedIcon from '../components/icons/BookmarkIcon.vue'
import ShareIcon from '../components/icons/ShareIcon.vue'

import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import { DateTime } from 'luxon'
import { useI18n } from 'vue-i18n'


defineProps(['hideMedia'])

const route = useRoute()
const { t } = useI18n()
const emit = defineEmits(['shouldLogin', 'imagesReady'])
const status = ref([])
const session = ref()
const comments = ref()
const loading = ref()
const haveMore = ref(true)
let llnApi = ""

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
  let opts = {}
  if (session.value) {
    opts.headers = {
      "Authorization": session.value.apiKey,
    }
  }
  fetch(`${llnApi}/o/status/${route.params.id}`, opts)
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
  let opts = {}
  if (session.value) {
    opts.headers = {
      "Authorization": session.value.apiKey,
    }
  }
  let resp = await fetch(`${llnApi}/o/status/${route.params.id}/comments?size=12${afterQuery}`, opts)
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

  let thread = status.value[status.value.length - 1]
  thread.bookmarked = !thread.bookmarked
  if (!thread.bookmarked) {
    thread.bookmarks--
  } else {
    thread.bookmarks++
  }
}

async function like() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  let thread = status.value[status.value.length - 1]

  let resp = await fetch(`${llnApi}/i/like/status/${thread.id}`, {
    method: 'post',
    headers: {
      "Authorization": session.value.apiKey,
    }
  })
  if (resp.status == 401) {
    emit('shouldLogin')
    return
  }
  if (resp.status != 200) {
    alert(await resp.text())
    return
  }

  thread.liked = !thread.liked
  if (!thread.liked) {
    thread.likeCount--
  } else {
    thread.likeCount++
  }
}

function comment() {
  if (!session.value) {
    emit('shouldLogin')
  }
}

function share() {
  let opts = {
    position: 'bottom-center',
    autoClose: 1000,
    hideProgressBar: true,
    closeButton: false,
    transition: 'slide'
  }
  navigator.clipboard.writeText(window.location.href)
    .then(() => toast(t('status.copied'), opts))
    .catch(() => toast(t('misc.badop'), opts))
}

function handleImagesReady(ctx) {
  emit('imagesReady', ctx)
}

</script>
<template>
  <main>
    <Title :title="$t('nav.thread')" :backbtn="true" />
    <ul class="status" v-if="status.length > 0">
      <li v-for="(s, index) in status"
        @click="index != status.length - 1 ? $router.push(`/${s.user.uniqueName}/status/${s.id}`) : ''">
        <Status :status="s" @shouldLogin="$emit('shouldLogin')" @imagesReady="handleImagesReady"
          :timeline="index != status.length - 1" :simple="index == status.length - 1" :hideMedia="hideMedia" />
      </li>
    </ul>
    <div class="stats" v-if="status.length > 0">
      <div class="time">{{
        DateTime.fromISO(status[status.length - 1].createTime).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) }}</div>
      <div class="item dot">·</div>
      <div class="item"><span>{{ status[status.length - 1].comments }}</span><span>Comments</span></div>
      <div class="item"><span>{{ status[status.length - 1].likeCount }}</span><span>Likes</span></div>
      <div class="item"><span>{{ status[status.length - 1].bookmarks }}</span><span>Bookmarks</span></div>
    </div>
    <div class="operate" v-if="status.length > 0">
      <a @click="comment" title="评论">
        <CommentIcon />
      </a>
      <a @click="like" title="喜欢">
        <LikeIcon v-if="!status[status.length - 1].liked" />
        <LikedIcon class="like" v-if="status[status.length - 1].liked" />
      </a>
      <a @click="bookmark" title="加入书签">
        <BookmarkIcon v-if="!status[status.length - 1].bookmarked" />
        <BookmarkedIcon v-if="status[status.length - 1].bookmarked" />
      </a>
      <a @click="share" title="分享">
        <ShareIcon />
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
    <Loading v-if="status.length == 0 || !comments || loading" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
  background-color: #fff;
  z-index: 1000;
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

.stats,
.operate {
  height: 50px;
  padding: 0;
  margin: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 1px solid rgb(239, 243, 244);
}

.stats {
  justify-content: left;
  padding: 14px 5px;
  display: block;
  line-height: 22px;
  height: auto;

}

.stats .item {
  margin: 0 10px;
  display: inline-block;
}

.stats .item span:first-child {
  font-weight: bold;
}

.stats .item span:last-child {
  margin-left: 5px;
  color: rgb(83, 100, 113);
}

.stats .time {
  display: inline-block;
  color: rgb(83, 100, 113);
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
  width: 22px;
  fill: rgb(83, 100, 113);
}

.operate .like {
  fill: #d6204b;
}

.status li {
  border-bottom: none;
}

.status li:last-child {
  background: none;
  cursor: auto;
}

@media (max-width: 60rem) {
  .stats .time {
    display: block;
  }

  .stats .dot {
    display: none;
  }

  .stats .item:nth-child(3) {
    margin-left: 0;
  }

}
</style>