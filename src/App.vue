<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Login from './components/Login.vue'
import ExploreIcon from './components/icons/IconExplore.vue'
import SettingsIcon from './components/icons/IconSettings.vue'
import HomeIcon from './components/icons/IconHome.vue'

</script>

<template>
  <div class="sidebar">
    <nav>
      <ul>
        <li>
          <RouterLink to="/"><HomeIcon /></RouterLink>
        </li>
        <li>
          <RouterLink to="/explore"><ExploreIcon /><span>探索</span></RouterLink>
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
      <Login />
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
  width: 120px;
  padding: 10px 15px;
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
  flex: 0 0 600px;
}

footer {
  position: fixed;
  padding: 20px;
}</style>
