<script setup>
import { inject, onMounted, ref, nextTick, getCurrentInstance } from 'vue'
import { RouterLink } from 'vue-router'
import { DateTime } from 'luxon'

import Content from './Content.vue'
import CommentIcon from './icons/IconComment.vue'
import DefaultAvatarIcon from './icons/DefaultAvatarIcon.vue'
import LikeIcon from './icons/IconLike.vue'
import LikedIcon from './icons/LikedIcon.vue'
import ShareIcon from '../components/icons/ShareIcon.vue'


const emit = defineEmits(['shouldLogin', 'imagesReady'])
const props = defineProps(['status', 'timeline', 'hideMedia', 'simple'])
const { proxy } = getCurrentInstance()
const session = ref()
const avatar = ref()
let llnApi = ""

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
  const image = new Image()
  image.src = props.status.user.picture
  image.onload = () => {
    avatar.value = image.src
  }
  nextTick(() => {
    document.querySelectorAll('.copy').forEach(copy => {
      copy.onclick = copyCode
      copy.innerHTML = proxy.$t('btn.copy')
    })
  })
})

async function likeStatus() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  let resp = await fetch(`${llnApi}/i/like/status/${props.status.id}`, {
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

  props.status.liked = !props.status.liked
  if (!props.status.liked) {
    props.status.likeCount--
  } else {
    props.status.likeCount++
  }
}

function sendImagesReady(data) {
  emit('imagesReady', data)
}

function copyCode(e) {
  e.stopPropagation()
  navigator.clipboard.writeText(e.target.parentElement.querySelector('pre code').innerText)
    .then(() => e.target.innerText = proxy.$t('tips.copied')
    )
    .catch(() => proxy.$toast(proxy.$t('misc.badop')))
}

function share() {
  navigator.clipboard.writeText(`${window.location.origin}/${props.status.user.uniqueName}/status/${props.status.id}`)
    .then(() => proxy.$toast(proxy.$t('tips.copied')))
    .catch(() => proxy.$toast(proxy.$t('misc.badop')))
}
</script>
<template>
  <div class="status">
    <div class="avatararea">
      <RouterLink @click.stop :to="`/${status.user.uniqueName}`" class="avatar">
        <img v-if="avatar" class="avatarimg" :src="status.user.picture" alt="avatar" />
        <DefaultAvatarIcon class="avatarimg" v-else />
      </RouterLink>
      <div v-if="timeline" class="timeline"></div>
    </div>
    <div class="content">
      <div class="author" v-if="!simple">
        <RouterLink @click.stop :to="`/${status.user.uniqueName}`">{{ status.user.name }}</RouterLink>
        <span>@{{ status.user.uniqueName }}</span>
        <span class="w">·</span>
        <span class="w" :title="DateTime.fromISO(status.createTime).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)">{{
          DateTime.fromISO(status.createTime).toRelative() }}</span>
      </div>
      <div class="author simpleauthor" v-if="simple">
        <RouterLink @click.stop :to="`/${status.user.uniqueName}`">{{ status.user.name }}</RouterLink>
        <span>@{{ status.user.uniqueName }}</span>
      </div>
      <div v-if="status.prev && status.prev.user" class="replyflag">
        {{ $t('status.replying') }} <RouterLink @click.stop :to="`/${status.prev.user.uniqueName}`">@{{
          status.prev.user.uniqueName }}</RouterLink>
      </div>
      <Content v-if="!simple" :status="status" :simple="simple" :hideMedia="hideMedia" @imagesReady="sendImagesReady" />
      <div class="op" v-if="!simple">
        <a :title="$t('btn.comment')">
          <div class="icon">
            <CommentIcon :title="$t('btn.comment')"/>
          </div><span>{{ status.comments }}</span>
        </a>
        <a @click.stop="likeStatus" :title="$t('btn.like')">
          <div class="icon">
            <LikeIcon v-if="!status.liked" :title="$t('btn.like')"/>
            <LikedIcon class="like" v-if="status.liked" />
          </div><span>{{ status.likeCount }}</span>
        </a>
        <a @click.stop="share" :title="$t('btn.share')">
          <div class="icon">
            <ShareIcon :title="$t('btn.share')"/>
          </div>
        </a>
      </div>
    </div>
  </div>
  <div v-if="simple" class="simplestatus">
    <Content :status="status" :simple="simple" :hideMedia="hideMedia" @imagesReady="sendImagesReady" />
  </div>
</template>
<style scoped>
.status {
  display: flex;
  width: 100%;
}

.simplestatus {
  margin-top: 5px;
}

.avatararea {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatararea .timeline {
  display: flex;
  width: 2px;
  background-color: var(--lln-color-timeline);
  flex-grow: 1;
  min-height: calc(100% - 26px);
  margin-top: 3px;
}

.avatar,
.avatar .avatarimg {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.avatar svg {
  width: 40px;
  height: 40px;
}

.content {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  flex: 1;
  min-width: 0;
}

.content .author {
  line-height: 16px;
  margin-bottom: 5px;
  color: var(--lln-color-text);
}

.content .author span {
  color: rgb(83, 100, 113);
  margin-left: 10px;
}

.content .author .w {
  margin-left: 5px;
}

.content .author a {
  color: var(--lln-color-text);
  font-weight: bold;
}

.content .author a:hover {
  text-decoration: underline;
  text-decoration-color: var(--lln-color-text);
  background: none;
}

.content .simpleauthor {
  display: flex;
  flex-direction: column;
  height: 40px;
  justify-content: center;
}

.content .simpleauthor span {
  margin-left: 0;
}

.content .replyflag {
  color: rgb(83, 100, 113);
}

.content .raw {
  display: flex;
  flex-direction: column;
}

.content .raw .paragraph {
  margin-bottom: 15px;
  word-break: break-all;
  width: 100%;
}

.content .sf {
  display: flex;
  align-items: center;
}

.content .showMore {
  margin-left: 2px;
}

.content .sf .icon {
  width: 18px;
  height: 18px;
}

.content .sf .error {
  color: red;
  margin-left: 5px;
  font-size: 13px;
}

.content .sf .tips {
  color: #bbb;
  margin-left: 5px;
  font-size: 13px;
}

.content .media {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  margin: 10px 0;
}

.content .media .fc {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  width: 0;
  margin-right: 5px;
}

.content .media .fc .h50:first-child {
  margin-bottom: 5px;
}

.content .media .image {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 15px;
  min-width: min-content;
  border: 1px solid #bbb;
  box-sizing: content-box;
}

.content .media .w50 {
  margin-right: 5px;
}

.content .media .h50 img {
  min-height: 40px;
  max-height: 200px;
}

.content .media .h50 {
  width: auto;
}

.content .media .h100 img {
  min-height: 80px;
  max-height: 400px;
}


.content .media img {
  min-height: 80px;
  max-height: 566px;
  max-width: 100%;
}

@media (max-width: 60rem) {
  .content .media img {
    min-height: 60px;
    max-height: 300px;
  }

  .content .media .h100 img {
    min-height: 40px;
    max-height: 200px;
  }

  .content .media .h50 img {
    min-height: 20px;
    max-height: 97px;
  }
  .avatararea .timeline {
    width: 1.5px;
  }
}

.content .op {
  display: flex;
  margin: 5px 0 0 -6px;
}

.content .op a {
  display: flex;
  align-items: center;
  width: 80px;
}

.content .op a:hover {
  background: none;
  cursor: pointer;
}

.content .op a:hover .icon {
  background-color: rgba(29, 155, 240, 0.1);
  transition: 0.4s;
}

.content .op a:hover span {
  color: rgb(29, 155, 240);
}

.content .op a:hover .icon svg {
  fill: rgb(29, 155, 240);
}

.content .op a span {
  margin-left: 5px;
  font-size: 14px;
  color: rgb(83, 100, 113);
}

.content .op a .icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  width: 30px;
  border-radius: 50%;
}

.content .op a .icon svg {
  width: 18px;
  height: 18px;
  fill: rgb(83, 100, 113);
}

.content .op a .like {
  fill: #d6204b;
}
</style>
