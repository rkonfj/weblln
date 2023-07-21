<script setup>
import { onMounted, ref, nextTick, getCurrentInstance, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { DateTime } from 'luxon'

import lln from '../lln'

import Content from './Content.vue'
import Avatar from './Avatar.vue'
import CommentIcon from './icons/IconComment.vue'
import DefaultAvatarIcon from './icons/DefaultAvatarIcon.vue'
import LikeIcon from './icons/IconLike.vue'
import LikedIcon from './icons/LikedIcon.vue'
import ViewsIcon from './icons/ViewsIcon.vue'
import ShareIcon from '../components/icons/ShareIcon.vue'
import MenuIcon from '../components/icons/MenuIcon.vue'
import DeleteIcon from '../components/icons/DeleteIcon.vue'
import FollowIcon from '../components/icons/FollowIcon.vue'
import UnfollowIcon from '../components/icons/UnfollowIcon.vue'
import CodeIcon from '../components/icons/CodeIcon.vue'
import Verified from '../components/Verified.vue'


const emit = defineEmits(['shouldLogin', 'imagesReady', 'deleted'])
const props = defineProps(['status', 'timeline', 'hideMedia', 'simple', 'menu'])
const { proxy } = getCurrentInstance()
const session = ref()
const avatar = ref()
const menuOpened = ref()
const confirmed = ref()

function closeMenu() {
  menuOpened.value = false
  confirmed.value = false
  if (props.menu) {
    for (let item of props.menu) {
      item.confirmed = false
    }
  }
}

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  const image = new Image()
  image.src = lln.avatarPreview(props.status.user.picture)
  image.onload = () => {
    avatar.value = image.src
  }
  nextTick(() => {
    document.querySelectorAll('.copy').forEach(copy => {
      copy.onclick = copyCode
      copy.innerHTML = proxy.$t('btn.copy')
    })
  })
  document.addEventListener('click', closeMenu)
  window.addEventListener('touchmove', closeMenu)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeMenu)
  window.removeEventListener('touchmove', closeMenu)
})

async function likeStatus() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  try {
    await proxy.$lln.status.like(props.status.id, session.value)
  } catch (e) {
    if (resp.status == 401) {
      emit('shouldLogin')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
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

async function follow() {
  if (props.status.followed && !confirmed.value) {
    confirmed.value = true
    return
  }
  try {
    await proxy.$lln.user.follow(props.status.user.uniqueName, session.value)
    props.status.followed = !props.status.followed
    proxy.$toast(proxy.$t('tips.success'), { type: 'success' })
  } catch (e) {
    if (e.code == 401) {
      emit('shouldLogin')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
  confirmed.value = false
}

async function deleteStatus() {
  if (!confirmed.value) {
    confirmed.value = true
    return
  }
  try {
    await proxy.$lln.status.delete(props.status.id, session.value)
    emit('deleted')
    proxy.$toast(proxy.$t('tips.success'), { type: 'success' })
  } catch (e) {
    if (e.code == 401) {
      emit('shouldLogin')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
  confirmed.value = false
}
</script>
<template>
  <div class="status">
    <div class="menu">
      <a class="icon" v-if="!menuOpened" @click.stop="menuOpened = !menuOpened">
        <MenuIcon @click.stop="menuOpened = !menuOpened" />
      </a>
      <transition name="fade">
        <ul v-if="menuOpened">
          <li v-for="item in menu" @click.stop="(item.confirmed = item.action(status)) ? '' : (menuOpened = false)">
            <component :is="item.component"></component>
            <span v-if="item.confirmed">{{ item.confirmedtitle }}</span>
            <span v-if="!item.confirmed">{{ item.title }}</span>
          </li>
          <li @click.stop="deleteStatus" v-if="session && status.user.id == session.id && status.comments == 0">
            <DeleteIcon class="delete" />
            <span v-if="confirmed" class="delete"> {{ $t('tips.confirmdelete') }}</span>
            <span v-if="!confirmed" class="delete">{{ $t('btn.delete') }}</span>
          </li>
          <li @click.stop="follow" v-if="session && status.followed">
            <UnfollowIcon />
            <span v-if="confirmed">
              {{ $t('tips.confirmunfollow') }} @{{ status.user.uniqueName }}
            </span>
            <span v-if="!confirmed">{{ $t('btn.unfollow') }} @{{ status.user.uniqueName }}</span>
          </li>
          <li @click.stop="follow" v-if="session && status.user.id != session.id && !status.followed">
            <FollowIcon /><span>{{ $t('btn.follow') }} @{{ status.user.uniqueName }}</span>
          </li>
          <li @click.stop="$toast('暂不支持')">
            <CodeIcon /><span>{{ $t('btn.embedtweet') }}</span>
          </li>
        </ul>
      </transition>
    </div>
    <div class="avatararea">
      <RouterLink @click.stop :to="`/${status.user.uniqueName}`" class="avatar">
        <Avatar v-if="avatar" class="avatarimg" :src="status.user.picture" />
        <DefaultAvatarIcon class="avatarimg" v-else />
      </RouterLink>
      <div v-if="timeline" class="timeline"></div>
    </div>
    <div class="content">
      <div class="author" @click.stop="$router.push(`/${status.user.uniqueName}`)" v-if="!simple">
        <a>{{ status.user.name }}</a>
        <Verified v-if="status.user.verifiedCode > 0" :code="status.user.verifiedCode" />
        <span>@{{ status.user.uniqueName }}</span>
        <span class="w">·</span>
        <span class="w" :title="DateTime.fromISO(status.createTime).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)">{{
          DateTime.fromISO(status.createTime).toRelative() }}</span>
      </div>
      <div class="author simpleauthor" @click.stop="$router.push(`/${status.user.uniqueName}`)" v-if="simple">
        <a>
          {{ status.user.name }}
          <Verified v-if="status.user.verifiedCode > 0" :code="status.user.verifiedCode" />
        </a>
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
            <CommentIcon :title="$t('btn.comment')" />
          </div><span>{{ status.comments }}</span>
        </a>
        <a @click.stop="likeStatus" :title="$t('btn.like')">
          <div class="icon">
            <LikeIcon v-if="!status.liked" :title="$t('btn.like')" />
            <LikedIcon class="like" v-if="status.liked" />
          </div><span>{{ status.likeCount }}</span>
        </a>
        <a :title="$t('status.views')">
          <div class="icon">
            <ViewsIcon :title="$t('status.views')" />
          </div><span>{{ status.views }}</span>
        </a>
        <a @click.stop="share" :title="$t('btn.share')">
          <div class="icon">
            <ShareIcon :title="$t('btn.share')" />
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
  position: relative;
}

.status .menu {
  position: absolute;
  top: -6px;
  right: -5px;
  z-index: 11;
}

.status .menu ul {
  background-color: var(--color-background);
  border: 1px solid var(--lln-color-border);
  border-radius: 15px;
  box-shadow: 0 0 5px var(--lln-color-border);
  padding: 0;
}

.status .menu ul li {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 42px;
  line-height: 42px;
  font-size: 15px;
  cursor: pointer;
  transition: 0.4s;
}

.status .menu ul li:hover {
  background-color: var(--lln-color-bg-hover);
}

.status .menu ul li svg {
  width: 18px;
  height: 18px;
  fill: var(--lln-color-text);
}

.status .menu ul li .delete {
  color: red;
  fill: red;
}

.status .menu ul li span {
  margin-left: 10px;
}

.status .menu .icon {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  width: 36px;
  border-radius: 50%;
  cursor: pointer;
}


.status .menu .icon svg {
  width: 20px;
  height: 20px;
  fill: rgb(83, 100, 113);
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
  border: .5px solid var(--lln-color-border);
  box-shadow: 0 0 2px var(--lln-color-border);
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
  margin-top: 5px;
  overflow: hidden;
}

.content .author {
  line-height: 16px;
  margin-bottom: 5px;
  color: var(--lln-color-text);
  display: flex;
  cursor: pointer;
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
}

.content .simpleauthor a {
  display: flex;
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
  line-height: 18px;
}

.content .sf .tips {
  color: #bbb;
  margin-left: 5px;
  font-size: 13px;
  line-height: 18px;
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
  height: 34px;
  width: 34px;
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

@media (max-width: 60rem) {
  .status .menu {
    top: -10px
  }

  .status .menu ul {
    margin-top: 2px;
  }

  .content {
    margin-top: 0;
  }

  .content .author span {
    font-size: 13px;
  }

  .avatararea .timeline {
    width: 1.5px;
  }

  .content .op a span {
    font-size: 12px;
    margin-left: 3px;
  }

  .content .op a .icon {
    height: 26px;
    width: 26px;
    margin-left: 1px;
  }

  .content .op a .icon svg {
    width: 16px;
    height: 16px;
  }
}
</style>
