<template>
  <h2><a v-if="backbtn" @click="$router.go(-1)">
      <IconBack />
    </a><span>{{ title }}</span></h2>
</template>

<script setup>
import IconBack from './icons/IconBack.vue'
defineProps(['title', 'backbtn'])
</script>

<style scoped>
h2 {
  padding: 0 1rem;
  display: flex;
  align-items: center;
  width: 100%;
  height: 3.2rem;
  background-color: var(--lln-color-title-bg);
  position: sticky;
  top: 0;
  color: var(--color-text);
  backdrop-filter: blur(10px);
  z-index: 10000;
}

h2 span {
  font-size: 20px;
  font-weight: bold;
  color: var(--lln-color-text);
}

h2 a {
  display: flex;
  width: 36px;
  height: 36px;
  justify-content: center;
  align-items: center;
  margin: 0 22px 0 -9px;
  cursor: pointer;
  border-radius: 50%;
}

h2 a:hover {
  background-color: rgba(15, 20, 25, 0.1);
}

@media (max-width: 60rem) {
  h2 a svg {
    width: 20px;
    height: 20px;
  }
  h2 span {
    font-size: 16px;
  }
}
</style>