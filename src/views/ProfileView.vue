<script setup>
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import Status from '../components/Status.vue'
import Button from '../components/Button.vue'
import Avatar from '../components/Avatar.vue'
import ProfileBgImage from '../components/ProfileBgImage.vue'
import CalendarIcon from '../components/icons/IconCalendar.vue'
import Verified from '../components/Verified.vue'
import UpIcon from '../components/icons/UpIcon.vue'
import MenuIcon from '../components/icons/MenuIcon.vue'
import DisableIcon from '../components/icons/DisableIcon.vue'
import SuccessIcon from '../components/icons/SuccessIcon.vue'

import { ref, markRaw, onMounted, getCurrentInstance, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { DateTime } from 'luxon'
import { loadSession } from '../lln'
import { disableUser as apiDisableUser, enableUser as apiEnableUser } from '../api/admin'

const emit = defineEmits(['shouldLogin'])
const { proxy } = getCurrentInstance()
const route = useRoute()
const profile = ref()
const session = ref()
const status = ref([])
const loading = ref(true)
const haveMore = ref()
const profileBgImage = ref()
const menuOpened = ref()
const disableConfirmed = ref()

async function onDocumentScroll() {
  let height = document.documentElement.scrollHeight - document.documentElement.scrollTop
  if (height === document.documentElement.clientHeight && !loading.value && haveMore.value) {
    await loadStatus(status.value[status.value.length - 1].createRev)
  }
}

function closeMenu() {
  menuOpened.value = false
  disableConfirmed.value = false
}

onMounted(async () => {
  session.value = loadSession()
  await loadProfile()
  window.addEventListener('scroll', onDocumentScroll)
  document.addEventListener('click', closeMenu)
  window.addEventListener('touchmove', closeMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onDocumentScroll)
})

async function loadProfile() {
  try {
    profile.value = await proxy.$lln.user.profile(route.params.uniqueName, session.value)
    document.title = `${profile.value.name} ${profile.value.tweets} Tweets - ${document.title}`
    const bgImage = new Image()
    bgImage.src = profile.value.bg
    bgImage.onload = () => {
      profileBgImage.value = bgImage.src
    }
    loadStatus()
  } catch (e) {
    if (e.code == 404) {
      proxy.$toast('Not Found', { type: 'error' })
      setTimeout(() => proxy.$router.push('/explore'), 1000)
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
}

async function loadStatus(after) {
  loading.value = true
  try {
    let resp = await proxy.$lln.user.status(route.params.uniqueName, after, 15, session.value)
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

async function follow() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  try {
    await proxy.$lln.user.follow(profile.value.uniqueName, session.value)
    profile.value.following = !profile.value.following
    profile.value.following ? profile.value.followers++ : profile.value.followers--
  } catch (e) {
    if (resp.status == 401) {
      emit('shouldLogin')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
}

function buildMenu(i) {
  const statusMenu = ref([])
  if (session.value?.admin) {
    statusMenu.value = [{
      component: markRaw(UpIcon),
      title: proxy.$t('btn.recommend'),
      confirmedtitle: proxy.$t('btn.confirm'),
      action: recommend, i: i
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

async function disableUser() {
  if (!disableConfirmed.value) {
    disableConfirmed.value = true
    return
  }
  try {
    await apiDisableUser(profile.value.id, session.value)
    profile.value.disabled = true
    proxy.$toast(proxy.$t('tips.success'), { type: 'success' })
  } catch (e) {
    if (e.code == 403 || e.code == 401) {
      proxy.$toast(proxy.$t('tips.sessionExpired'), { type: 'error' })
      proxy.$router.replace('/logout')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
  disableConfirmed.value = false
}

async function enableUser() {
  if (!disableConfirmed.value) {
    disableConfirmed.value = true
    return
  }
  try {
    await apiEnableUser(profile.value.id, session.value)
    profile.value.disabled = false
    proxy.$toast(proxy.$t('tips.success'), { type: 'success' })
  } catch (e) {
    if (e.code == 403 || e.code == 401) {
      proxy.$toast(proxy.$t('tips.sessionExpired'), { type: 'error' })
      proxy.$router.replace('/logout')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
  disableConfirmed.value = false
}
</script>
<template>
  <main>
    <Title :title="profile ? profile.name : ''" backbtn="true"
      :tips="`${profile ? profile.tweets : 0} ${$t('tips.tweets')}`" />
    <div v-if="profile" class="mainarea">
      <div class="bg">
        <ProfileBgImage :src="profile.bg" />
      </div>
      <div class="profile">
        <div class="op">
          <Avatar class="avatar" :src="profile.picture" />
        </div>
        <div class="info">
          <div class="operates">
            <div v-if="session && session.admin && session.id != profile.id" class="menuArea">
              <a class="icon" v-if="!menuOpened" @click.stop="menuOpened = !menuOpened">
                <MenuIcon @click.stop="menuOpened = !menuOpened" />
              </a>
              <transition name="slide-fade">

                <ul v-if="menuOpened" class="menu">
                  <li v-if="!profile.disabled" @click.stop="disableUser">
                    <DisableIcon />
                    <span v-if="!disableConfirmed">{{ $t('btn.disable') }}</span>
                    <span v-if="disableConfirmed">{{ $t('btn.confirm') }}</span>
                  </li>
                  <li v-if="profile.disabled" @click.stop="enableUser">
                    <SuccessIcon />
                    <span v-if="!disableConfirmed">{{ $t('btn.enable') }}</span>
                    <span v-if="disableConfirmed">{{ $t('btn.confirm') }}</span>
                  </li>
                </ul>
              </transition>
            </div>
            <Button class="follow" v-if="!session || session.id != profile.id" @click="follow"
              :btn="session && profile.following ? $t('user.following') : $t('btn.follow')" />
          </div>
          <div class="n">{{ profile.name }}
            <Verified v-if="profile.verifiedCode > 0" size="18" :code="profile.verifiedCode"
              :title="$t(`verified.c${profile.verifiedCode}`)" />
          </div>
          <div class="un">@{{ profile.uniqueName }}</div>
          <div class="bio" v-if="profile.bio && profile.bio.length > 0">{{ profile.bio }}</div>
          <div class="join">
            <CalendarIcon /><span>{{ DateTime.fromISO(profile.createTime).toRelative() }}</span>加入
          </div>
        </div>
        <div class="info">
          <div class="item">
            <a class="" @click="$toast('暂不支持查看', { type: 'warning' })"><span>{{ profile.followings }}</span> {{
              $t('user.following') }}</a>
          </div>
          <div class="item">
            <a class="" @click="$toast('暂不支持查看', { type: 'warning' })"><span>{{ profile.followers }}</span> {{
              $t('user.followers') }}</a>
          </div>
        </div>
      </div>
    </div>
    <ul>
      <li v-for="(s, i) in status" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status @shouldLogin="$emit('shouldLogin')" :key="s.id" @deleted="status.splice(i, 1)" :status="s"
          :menu="buildMenu(i)" />
      </li>
    </ul>
    <div class="loadbtn" v-if="haveMore && !loading" @click="loadStatus(status[status.length - 1].createRev)">
      加载更多
    </div>
    <Loading v-if="!profile || loading" />
  </main>
</template>

<style scoped>
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

.mainarea {
  border-bottom: 1px solid var(--lln-color-border);
}

.mainarea .bg {
  width: 100%;
  aspect-ratio: 3/1;
  background-color: var(--lln-color-timeline);
}

.mainarea .bg img {
  width: 100%;
  aspect-ratio: 3/1;
  margin-bottom: -5px;
  object-fit: cover;
}

.mainarea .op {
  display: flex;
}

.mainarea .avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  margin: -78px 0 0 20px;
  border: 5px solid #fff;
  display: flex;
  background-color: #fff;
}

.mainarea .info {
  padding: 3px 15px;
  position: relative;
}

.mainarea .info:last-child {
  margin-bottom: 15px;
}

.mainarea .info .item {
  display: inline-block;
  margin-right: 20px;
}

.mainarea .info .item a {
  color: rgb(83, 100, 113);
  font-size: 14px;
}

.mainarea .info .item a span {
  color: var(--lln-color-text);
  font-weight: bold;
}

.mainarea .info .item a:hover {
  background: none;
  text-decoration: underline;
  cursor: pointer;
}

.mainarea .operates {
  display: flex;
  position: absolute;
  top: -45px;
  right: 15px;
  align-items: center;
}

.mainarea .operates .menuArea {
  position: relative;
  width: 165px;
  height: 35px;
  display: flex;
  justify-content: right;
}

.mainarea .operates .menuArea .icon {
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: content-box;
  border: .5px solid var(--lln-color-timeline);
  border-radius: 50%;
  cursor: pointer;
  margin-right: 10px;
  color: var(--lln-color-text);
}

.mainarea .operates .menuArea .icon svg {
  width: 24px;
  height: 24px;
}

.mainarea .operates .menu {
  top: 0;
  right: 10px;
  position: absolute;
  background-color: var(--color-background);
  border: 1px solid var(--lln-color-border);
  border-radius: 15px;
  box-shadow: 0 0 5px var(--lln-color-border);
  padding: 0;
}

.mainarea .operates .menu li {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 42px;
  line-height: 42px;
  font-size: 15px;
  cursor: pointer;
  transition: 0.4s;
}

.mainarea .operates .menu li svg {
  width: 18px;
  height: 18px;
  margin-right: 10px;
}

.mainarea .profile .bio {
  margin-top: 10px;
}

.mainarea .profile .n {
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.mainarea .profile .un {
  font-size: 13px;
}

.mainarea .profile .join {
  display: flex;
  align-items: center;
  color: rgb(83, 100, 113);
  fill: rgb(83, 100, 113);
  margin: 6px 0 0 0;
}

.mainarea .profile .join span {
  margin: 0 10px 0 5px;
}

@media (max-width: 60rem) {
  main ul li:hover {
    background-color: unset;
  }
}
</style>