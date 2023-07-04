<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, onMounted, getCurrentInstance } from 'vue'

import Login from './components/Login.vue'
import Labels from './components/Labels.vue'
import ExploreIcon from './components/icons/IconExplore.vue'
import SettingsIcon from './components/icons/IconSettings.vue'
import HomeIcon from './components/icons/IconHome.vue'
import MessageIcon from './components/icons/IconMessage.vue'
import BookmarkIcon from './components/icons/IconBookmark.vue'
import SessionUser from './components/SessionUser.vue'
import Loading from './components/Loading.vue'

const { proxy } = getCurrentInstance()
const session = ref()
const loading = ref()
const shouldLogin = ref()
const router = useRouter()
const tips = ref()
const mobileSidebar = ref()
const mobileMain = ref()

router.beforeEach(() => {
  loading.value = true
  closeNav()
  loadTipMessages()
})

router.afterEach(() => {
  loading.value = false
})

const vSwipe = {
  mounted: (el, binding) => {
    let startX, startY

    el.addEventListener('touchstart', (event) => {
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
    }, { passive: true });

    el.addEventListener('touchmove', (event) => {
      const deltaX = event.touches[0].clientX - startX
      const deltaY = event.touches[0].clientY - startY

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        binding.value(deltaX)
      }
    }, { passive: true })
  }
}

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  loadSiteRestriction()
})

function loadSiteRestriction() {
  if (session.value) {
    proxy.$lln.misc.restriction(session.value).then(r => {
      window.localStorage.setItem('restriction', JSON.stringify(r))
    })
  }
}

function logout() {
  session.value = null
  window.localStorage.removeItem('session')
}

function shakeLogin() {
  shouldLogin.value = true
  setTimeout(() => shouldLogin.value = false, 1000)
  logout()
}

async function loadTipMessages() {
  if (!session.value) {
    return
  }
  try {
    let resp = await proxy.$lln.message.tips(session.value)
    if (resp.headers.get("X-Session-Valid") == "false") {
      session.value = null
    }
    window.localStorage.setItem('tips', JSON.stringify(resp.v))
    if (resp.v == null) {
      tips.value = null
    } else if (resp.v.length == 100) {
      tips.value = '99+'
    } else {
      tips.value = resp.v.length
    }
  } catch (e) {
    console.error('load tips messages error: ', e.message)
  }

}
function openNav(v) {
  if (window.sessionStorage.getItem('disable-swipe-nav')) {
    return
  }
  if (v < 80) {
    return
  }
  mobileSidebar.value = {
    display: 'flex',
    flex: 1
  }
  mobileMain.value = {
    display: 'none'
  }
}
function closeNav(v) {
  if (window.sessionStorage.getItem('disable-swipe-nav')) {
    return
  }
  if (v > -80) {
    return
  }
  if (mobileSidebar.value) {
    mobileSidebar.value = {
      display: 'none',
    }
    mobileMain.value = {
      display: 'flex'
    }
  }
}
</script>

<template>
  <div class="sidebar" :style="mobileSidebar" v-swipe="closeNav">
    <nav>
      <ul>
        <li>
          <RouterLink class="home" to="/">
            <div class="version">beta</div>
            <HomeIcon />
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/explore">
            <ExploreIcon /><span>{{ session ? $t('nav.home') : $t('nav.explore') }}</span>
          </RouterLink>
        </li>
        <li v-if="session">
          <RouterLink class="msgLink" to="/messages">
            <div v-if="tips" class="tips">{{ tips }}</div>
            <MessageIcon /><span>{{ $t('nav.messages') }}</span>
          </RouterLink>
        </li>
        <li v-if="session">
          <RouterLink to="/bookmarks">
            <BookmarkIcon /><span>{{ $t('nav.bookmarks') }}</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/settings">
            <SettingsIcon /><span>{{ $t('nav.settings') }}</span>
          </RouterLink>
        </li>
      </ul>
      <SessionUser v-if="session" :session="session" />
    </nav>

  </div>
  <div class="main-content" v-swipe="openNav" :style="mobileMain">
    <RouterView @shouldLogin="shakeLogin" @tipsDeleted="loadTipMessages" v-slot="{ Component }">
      <transition>
        <keep-alive>
          <component v-if="!loading && $route.meta.keepalive" :is="Component" :key="$route.name" />
        </keep-alive>
      </transition>
      <transition>
        <component v-if="!loading && !$route.meta.keepalive" :is="Component" :key="$route.name" />
      </transition>
    </RouterView>
    <Loading v-if="loading" />
    <Login v-if="!session" :class="{ 'shake': shouldLogin }" />
  </div>
  <div class="right-sidebar">
    <footer>
      <Login v-if="!session" :class="{ 'shake': shouldLogin }" />
      <Labels @session-expired="logout" />
      <div class="foot">
        <span>
          <RouterLink to="/termsofservice">{{ $t('nav.termsofservice') }}</RouterLink>
          <RouterLink to="/privacypolicy">{{ $t('nav.privacypolicy') }}</RouterLink>
        </span>
        © {{ new Date().getFullYear() }} <a href="https://github.com/rkonfj/weblln">WebLLN</a>
      </div>
    </footer>
  </div>
  <div style="position: fixed"></div>
</template>

<style scoped>
nav {
  position: fixed;
  width: 300px;
  font-size: 18px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
}

nav ul li {
  padding: 5px;
}

nav ul .home,
nav ul .msgLink {
  position: relative;
}

nav ul .msgLink .tips {
  width: 20px;
  height: 20px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d6204b;
  color: #fff;
  border-radius: 50%;
  position: absolute;
  top: 7px;
  right: -5px;
}

nav ul .home .version {
  position: absolute;
  font-size: 14px;
  color: rgb(83, 100, 113);
  top: 2px;
  right: -25px;
}

nav ul .home svg {
  width: 38px;
  height: 38px;
  fill: var(--lln-color-text);
}

nav ul .home svg path {
  fill: #fff;
}

nav a.router-link-exact-active span {
  font-weight: bold;
  color: var(--lln-color-text);
}

nav a {
  display: flex;
  align-items: center;
  padding: 10px 20px 10px 15px;
  width: fit-content;
  border-radius: 30px;
  color: var(--color-text);
}

nav a svg {
  fill: var(--color-text);
}

nav ul li:first-child a {
  width: 52px;
  height: 52px;
  padding: 0;
  justify-content: center;
}

nav a span {
  margin-left: 10px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  flex: 0 0 38rem;
  align-items: flex-end;
  justify-content: space-between;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.main-content .sidelogin {
  display: none;
}

.right-sidebar {
  display: flex;
  flex: 0 0 38rem;
}

footer {
  position: fixed;
  padding: 0 20px;
}

footer .foot {
  padding: 18px 13px;
  font-size: 13px;
}

footer .foot a {
  color: #666;
  margin: 0 10px 0 0;
}

footer .foot a:hover {
  text-decoration: underline;
  text-decoration-color: #666;
  background: none;
}

.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-10px);
  }

  50% {
    transform: translateX(10px);
  }

  75% {
    transform: translateX(-10px);
  }

  100% {
    transform: translateX(0);
  }
}

@media (max-width: 60rem) {
  nav {
    width: 100%;
  }

  .sidebar,
  .right-sidebar {
    display: none;
  }

  .main-content {
    min-height: 100vh;
    justify-content: space-between;
  }

  .main-content .sidelogin {
    display: block;
    position: sticky;
    bottom: 0;
    background-color: #fff;
    width: 100%;
  }
}

@media (min-width: 60rem) and (max-width: 80rem) {
  .right-sidebar {
    display: none;
  }

  .sidebar {
    flex: 0 0 20rem;
  }
}

@media (min-width: 80rem) and (max-width: 90rem) {

  .sidebar,
  .right-sidebar {
    flex: 0 0 20rem;
  }
}

@media (min-width: 90rem) and (max-width: 100rem) {

  .sidebar,
  .right-sidebar {
    flex: 0 0 25rem;
  }
}

@media (min-width: 100rem) and (max-width: 110rem) {

  .sidebar,
  .right-sidebar {
    flex: 0 0 28rem;
  }
}

@media (min-width: 110rem) and (max-width: 120rem) {

  .sidebar,
  .right-sidebar {
    flex: 0 0 33rem;
  }
}

@media (min-width: 120rem) and (max-width: 130rem) {

  .sidebar,
  .right-sidebar {
    flex: 0 0 38rem;
  }
}
</style>
<style>
@media (min-width: 60rem) {
  .Toastify {
    --toastify-icon-color-success: #fff;
    --toastify-icon-color-error: #fff;
    --toastify-icon-color-warning: #fff;
  }

  .Toastify__toast {
    padding: 5px 12px;
    background-color: var(--color-main);
    box-shadow: var(--color-main);
    color: #fff;
  }

  .Toastify__toast--error {
    background-color: var(--toastify-color-error);
  }

  .Toastify__toast--warning {
    background-color: var(--toastify-color-warning);
  }

  .Toastify__toast-icon {
    width: 16px;
  }
}
</style>