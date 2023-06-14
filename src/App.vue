<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Login from './components/Login.vue'
import Labels from './components/Labels.vue'

import ExploreIcon from './components/icons/IconExplore.vue'
import SettingsIcon from './components/icons/IconSettings.vue'
import HomeIcon from './components/icons/IconHome.vue'
import MessageIcon from './components/icons/IconMessage.vue'
import BookmarkIcon from './components/icons/IconBookmark.vue'
import ProfileIcon from './components/icons/IconProfile.vue'

import { ref, onMounted } from 'vue'

const session = ref(null)

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if(sessionStr) {
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
          <RouterLink to="/"><HomeIcon /></RouterLink>
        </li>
        <li>
          <RouterLink to="/explore"><ExploreIcon /><span>{{ session?'主页':'探索' }}</span></RouterLink>
        </li>
        <li v-if="session">
          <RouterLink to="/messages"><MessageIcon /><span>消息</span></RouterLink>
        </li>
        <li v-if="session">
          <RouterLink to="/bookmarks"><BookmarkIcon /><span>书签</span></RouterLink>
        </li>
        <li v-if="session">
          <RouterLink :to="'/' + session.uniqueName"><ProfileIcon /><span>个人资料</span></RouterLink>
        </li>
        <li>
          <RouterLink to="/settings"><SettingsIcon /><span>设置</span></RouterLink>
        </li>
      </ul>
    </nav>
  </div>
  <div class="main-content">
    <RouterView />
  </div>
  <div class="right-sidebar">
    <footer>
      <Login v-if="!session" />
      <Labels @session-expired="logout"/>
    </footer>
  </div>
</template>

<style scoped>
nav {
  position: fixed;
  width: 300px;
  font-size: 18px;
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
}</style>
