<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Login from './components/Login.vue'
import Labels from './components/Labels.vue'

import ExploreIcon from './components/icons/IconExplore.vue'
import SettingsIcon from './components/icons/IconSettings.vue'
import HomeIcon from './components/icons/IconHome.vue'
import MessageIcon from './components/icons/IconMessage.vue'
import BookmarkIcon from './components/icons/IconBookmark.vue'
import LogoutIcon from './components/icons/IconLogout.vue'

import { ref, onMounted } from 'vue'

const session = ref(null)

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
})

function logout() {
  session.value = null
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
      <div class="user" v-if="session">
        <RouterLink class="profile" :to="'/' + session.uniqueName">
          <img :src="session.picture" alt="avatar" />
          <div class="namearea">
            <div class="n1">{{ session.name }}</div>
            <div class="n2">@{{ session.uniqueName }}</div>
          </div>
        </RouterLink>
        <RouterLink class="logout" to="/logout">
          <LogoutIcon />
        </RouterLink>
      </div>
    </nav>

  </div>
  <div class="main-content">
    <RouterView />
  </div>
  <div class="right-sidebar">
    <footer>
      <Login v-if="!session" />
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
  flex: 0 0 600px;
  align-items: flex-end;
  justify-content: space-between;
}

.sidebar .user {
  display: flex;
  border-radius: 80px;
  width: 250px;
  cursor: pointer;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  height: 68px;
}

.sidebar .user img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.sidebar .user .namearea {
  margin-left: 10px;
}

.sidebar .user .profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 68px;
}

.sidebar .user .logout {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  padding: 0;
  margin-right: -5px;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.sidebar .user a .n1 {
  font-weight: bold;
}

.sidebar .user a .n2 {
  font-size: 12px;
  color: #666;
}

.main-content {
  flex: 1;
}

.right-sidebar {
  display: flex;
  flex: 0 0 600px;
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
</style>
