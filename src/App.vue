<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

import Login from './components/Login.vue'
import Labels from './components/Labels.vue'
import ExploreIcon from './components/icons/IconExplore.vue'
import SettingsIcon from './components/icons/IconSettings.vue'
import HomeIcon from './components/icons/IconHome.vue'
import MessageIcon from './components/icons/IconMessage.vue'
import BookmarkIcon from './components/icons/IconBookmark.vue'
import SessionUser from './components/SessionUser.vue'
import Loadding from './components/Loadding.vue'

const session = ref()
const loading = ref()
const shouldLogin = ref()
const router = useRouter()

router.beforeEach(() => {
  loading.value = true
})

router.afterEach(() => {
  loading.value = false
})

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
})

function logout() {
  session.value = null
  window.localStorage.removeItem('session')
}

function shakeLogin() {
  shouldLogin.value = true
  setTimeout(() => shouldLogin.value = false, 1000)
  logout()
}
</script>

<template>
  <div class="sidebar">
    <nav>
      <ul>
        <li>
          <RouterLink to="/">
            <HomeIcon />
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/explore">
            <ExploreIcon /><span>{{ session ? '主页' : '探索' }}</span>
          </RouterLink>
        </li>
        <li v-if="session">
          <RouterLink to="/messages">
            <MessageIcon /><span>消息</span>
          </RouterLink>
        </li>
        <li v-if="session">
          <RouterLink to="/bookmarks">
            <BookmarkIcon /><span>书签</span>
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/settings">
            <SettingsIcon /><span>设置</span>
          </RouterLink>
        </li>
      </ul>
      <SessionUser v-if="session" :session="session" />
    </nav>

  </div>
  <div class="main-content">
    <RouterView v-if="!loading" @shouldLogin="shakeLogin" />
    <Loadding v-if="loading" />
    <Login v-if="!session" :class="{'shake' : shouldLogin}" />
    <div v-if="session" class="onmobile">
      <SessionUser :session="session" />
    </div>
  </div>
  <div class="right-sidebar">
    <footer>
      <Login v-if="!session" :class="{'shake' : shouldLogin}"/>
      <Labels @session-expired="logout" />
      <div v-if="session" class="foot">
        <RouterLink to="/rules">服务条款</RouterLink>
        <RouterLink to="/privacypolicy">隐私政策</RouterLink>
      </div>
    </footer>
  </div>
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

nav a.router-link-exact-active span {
  font-weight: bold;
}

nav a {
  display: flex;
  align-items: center;
  padding: 10px 20px 10px 15px;
  width: fit-content;
  border-radius: 30px;
  color: var(--color-text);
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
}

.main-content .sidelogin {
  display: none;
}

.main-content .onmobile {
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
  padding: 15px 15px;
  font-size: 14px;
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
  0% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
  75% { transform: translateX(-10px); }
  100% { transform: translateX(0); }
}

@media (max-width: 60rem) {

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

  .main-content .onmobile  {
    display: flex;
    position: sticky;
    bottom: 0;
    justify-content: center;
    background-color: #fff;
  }

  .main-content .onmobile .sessionuser {
    width: 100%;
    margin-bottom: 0;
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
}</style>
