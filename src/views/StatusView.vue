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
import UpIcon from '../components/icons/UpIcon.vue'

import { ref, markRaw, onMounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import { DateTime } from 'luxon'
import { loadSession } from '../lln'

defineProps(['hideMedia'])

const route = useRoute()
const emit = defineEmits(['shouldLogin', 'imagesReady'])
const { proxy } = getCurrentInstance()
const status = ref([])
const showTimeline = ref()
const session = ref()
const comments = ref([])
const loading = ref(true)
const haveMore = ref()

onMounted(async () => {
  session.value = loadSession()
  await loadStatus()
  await loadComments()
})

async function loadStatus() {
  try {
    let s = await proxy.$lln.status.getStatus(route.params.id, session.value)
    for (let c of s.content) {
      if (c.type == 'text') {
        document.title = `${c.value} - ${document.title}`
        break
      }
    }
    let prev = s.prev
    s.prev = null
    status.value.unshift(s)
    while (prev != null) {
      let s = prev
      prev = prev.prev
      s.prev = null
      status.value.unshift(s)
    }
  } catch (e) {
    if (e.code == 404) {
      proxy.$toast('Not Found', { type: 'error' })
      setTimeout(() => proxy.$router.push('/'), 1000)
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
}

async function loadComments(after) {
  loading.value = true
  try {
    let opts = {
      statusID: route.params.id,
      size: 12,
      after: after,
      session: session.value
    }
    let resp = await proxy.$lln.status.listComments(opts)
    haveMore.value = resp.more
    if (resp.v != null) {
      if (!after) {
        comments.value = resp.v
      } else {
        for (let s of resp.v) {
          comments.value.push(s)
        }
      }
    }
  } catch (e) {
    proxy.$toast(e.message, { type: 'error' })
  }
  loading.value = false
}

async function bookmark() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  try {
    await proxy.$lln.status.bookmark(route.params.id, session.value)
    let thread = status.value[status.value.length - 1]
    thread.bookmarked = !thread.bookmarked
    if (!thread.bookmarked) {
      thread.bookmarks--
    } else {
      thread.bookmarks++
    }
  } catch (e) {
    if (e.code == 401) {
      session.value = null
      emit('shouldLogin')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
}

async function like() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }

  try {
    let thread = status.value[status.value.length - 1]
    await proxy.$lln.status.like(thread.id, session.value)
    thread.liked = !thread.liked
    if (!thread.liked) {
      thread.likeCount--
    } else {
      thread.likeCount++
    }
  } catch (e) {
    if (e.code == 401) {
      emit('shouldLogin')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
}

function comment() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  if (status.value[status.value.length - 1].disabled) {
    proxy.$toast(proxy.$t('tips.disabled'))
  }
}

function share() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => proxy.$toast(proxy.$t('tips.copied')))
    .catch(() => proxy.$toast(proxy.$t('misc.badop')))
}

function handleImagesReady(ctx) {
  emit('imagesReady', ctx)
}

function buildMenu() {
  const statusMenu = ref([])
  if (session.value?.admin) {
    statusMenu.value = [{
      component: markRaw(UpIcon),
      title: proxy.$t('btn.recommend'),
      confirmedtitle: proxy.$t('btn.confirm'),
      action: recommend,
    }]
  }
  return statusMenu.value
}

function recommend(s) {
  if (!this.confirmed) {
    return true
  }
  proxy.$lln.status.recommend(s.id, true, session.value)
    .then(() => proxy.$toast(proxy.$t('tips.success'), { type: 'success' }))
    .catch(e => {
      if (e.code == 403) {
        proxy.$toast('Forbidden', { type: 'error' })
      }
    })
}
</script>
<template>
  <main>
    <Title :title="$t('nav.thread')" :backbtn="true" />
    <ul class="status" v-if="status.length > 2 && !showTimeline">
      <li @click="$router.push(`/${status[0].user.uniqueName}/status/${status[0].id}`)">
        <Status :status="status[0]" @shouldLogin="$emit('shouldLogin')" @imagesReady="handleImagesReady" timeline="true"
          :hideMedia="hideMedia" />
      </li>
      <li class="expandArea" v-if="status.length > 3" @click="showTimeline = !showTimeline">
        <div class="lineArea">
          <div v-for="a in [0, 0, 0]" class="timeline"></div>
          <div class="timeline last"></div>
        </div>
        <div class="btn">{{ $t('status.expandtimeline') }}</div>
      </li>
      <li @click="$router.push(`/${status[status.length - 2].user.uniqueName}/status/${status[status.length - 2].id}`)">
        <Status :status="status[status.length - 2]" @shouldLogin="$emit('shouldLogin')" @imagesReady="handleImagesReady"
          timeline="true" :hideMedia="hideMedia" />
      </li>
      <li>
        <Status :status="status[status.length - 1]" @shouldLogin="$emit('shouldLogin')" @imagesReady="handleImagesReady"
          simple="true" :hideMedia="hideMedia" />
      </li>
    </ul>
    <ul class="status" v-if="status.length == 2">
      <li @click="$router.push(`/${status[0].user.uniqueName}/status/${status[0].id}`)">
        <Status :status="status[0]" @shouldLogin="$emit('shouldLogin')" @imagesReady="handleImagesReady" timeline="true"
          :hideMedia="hideMedia" />
      </li>
      <li>
        <Status :status="status[status.length - 1]" @shouldLogin="$emit('shouldLogin')" @imagesReady="handleImagesReady"
          simple="true" :hideMedia="hideMedia" />
      </li>
    </ul>
    <ul class="status" v-if="status.length != 2 && showTimeline || status.length == 1">
      <li v-for="(s, index) in status"
        @click="index != status.length - 1 ? $router.push(`/${s.user.uniqueName}/status/${s.id}`) : ''">
        <Status :status="s" @shouldLogin="$emit('shouldLogin')" @imagesReady="handleImagesReady"
          :timeline="index != status.length - 1" :simple="index == status.length - 1" :hideMedia="hideMedia" />
      </li>
    </ul>
    <div class="stats" v-if="status.length > 0">
      <div class="time">{{
        DateTime.fromISO(status[status.length - 1].createTime).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) }}</div>
      <div class="item dot"
        v-if="status[status.length - 1].views + status[status.length - 1].comments + status[status.length - 1].likeCount + status[status.length - 1].bookmarks > 0">
        ·</div>
      <div class="item" v-if="status[status.length - 1].views > 0"><span>{{ status[status.length - 1].views
      }}</span><span>{{ $t('status.views') }}</span></div>
      <div class="item" v-if="status[status.length - 1].comments > 0"><span>{{ status[status.length - 1].comments
      }}</span><span>{{ $t('status.comments') }}</span></div>
      <div class="item" v-if="status[status.length - 1].likeCount > 0"><span>{{ status[status.length - 1].likeCount
      }}</span><span>{{ $t('status.likes') }}</span></div>
      <div class="item" v-if="status[status.length - 1].bookmarks > 0"><span>{{ status[status.length - 1].bookmarks
      }}</span><span>{{ $t('status.bookmarks') }}</span></div>
    </div>
    <div class="operate" v-if="status.length > 0">
      <a @click="comment" :title="$t('btn.comment')" v-if="!status[status.length - 1].disabled">
        <CommentIcon :title="$t('btn.comment')" />
      </a>
      <a @click="like" :title="$t('btn.like')">
        <LikeIcon v-if="!status[status.length - 1].liked" :title="$t('btn.like')" />
        <LikedIcon class="like" v-if="status[status.length - 1].liked" />
      </a>
      <a @click="bookmark" :title="$t('btn.bookmark')">
        <BookmarkIcon v-if="!status[status.length - 1].bookmarked" :title="$t('btn.bookmark')" />
        <BookmarkedIcon v-if="status[status.length - 1].bookmarked" />
      </a>
      <a @click="share" :title="$t('btn.share')">
        <ShareIcon :title="$t('btn.share')" />
      </a>
    </div>
    <Post v-if="session && status.length > 0 && !status[status.length - 1].disabled" @posted="loadComments"
      :placeholder="$t('status.replyPrompt')" :btntext="$t('status.reply')" :prevstatus="status[status.length - 1].id" />
    <ul>
      <div v-for="(s, i) in comments">
        <li @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)" :style="s.next ? `border-bottom: none;` : ''">
          <Status @shouldLogin="$emit('shouldLogin')" @deleted="comments.splice(i, 1)" :key="s.id" :timeline="s.next"
            :status="s" :menu="buildMenu()" />
        </li>
        <li @click="$router.push(`/${s.next.user.uniqueName}/status/${s.next.id}`)" v-if="s.next">
          <Status @shouldLogin="$emit('shouldLogin')" @deleted="s.next = null" :key="s.next.id" :status="s.next"
            :menu="buildMenu()" />
        </li>
      </div>
    </ul>
    <div class="loadbtn" v-if="haveMore && !loading" @click="loadComments(comments[comments.length - 1].createRev)">
      {{ $t('nav.showmore') }}
    </div>
    <Loading v-if="status.length == 0 || loading" />
  </main>
</template>

<style scoped>
main {
  background-color: var(--color-background);
  z-index: 10;
}

main .loadbtn,
main ul li {
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid var(--lln-color-border);
  background-color: var(--color-background);
}

main ul .expandArea {
  display: flex;
}

main ul .expandArea .lineArea {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
}

main ul .expandArea .lineArea .last {
  min-height: 15px;
  margin-bottom: -18px;
}

main ul .expandArea .btn {
  display: flex;
  align-items: center;
  margin-left: 10px;
  color: hsla(160, 100%, 37%, 1);
  cursor: pointer;
  height: 30px;
}

main ul li .timeline {
  display: flex;
  width: 2px;
  height: 2px;
  flex-grow: 1;
  background-color: var(--lln-color-timeline);
  margin-bottom: 5px;
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

.stats,
.operate {
  height: 50px;
  padding: 0;
  margin: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-bottom: 1px solid var(--lln-color-border);
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

.stats .dot {
  margin-right: 0px;
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
    font-size: 13px;
    height: 16px;
  }

  .stats .item {
    font-size: 13px;
    height: 16px;
  }

  .stats .dot {
    display: none;
  }

  .stats .item:nth-child(3) {
    margin-left: 0;
  }

  .operate {
    height: 46px;
  }

  .operate svg {
    height: 18px;
    width: 18px;
  }

  main ul li:hover {
    background-color: unset;
  }

  main ul .expandArea {
    padding: 5px 15px;
  }

  main ul li .timeline {
    width: 1.5px;
    height: 3px;
    flex-grow: 0;
    margin-bottom: 6px;
  }
}
</style>