<template>
    <h2><a v-if="backbtn"><IconBack @click="$router.go(-1)" /></a><span>{{ title }}</span></h2>
</template>

<script setup>
import IconBack from './icons/IconBack.vue'
defineProps(['title','backbtn'])
</script>

<style scoped>
h2 {
  padding: 0 1rem;
  display: flex;
  align-items: center;
  width: 100%;
  height: 3.2rem;
  background-color: rgba(255, 255, 255, 0.5);
  position: sticky;
  top: 0;
  backdrop-filter: blur(10px);
  z-index: 10000;
}

h2 span {
  font-size: 20px;
  font-weight: bold;
  color: #000;
}

h2 a {
  display: flex;
  width: 36px;
  height: 36px;
  justify-content: center;
  align-items: center;
  margin:0 22px 0 -9px;
  cursor: pointer;
  border-radius: 50%;
}

h2 a:hover {
  background-color: rgba(15, 20, 25, 0.1);
}
</style>