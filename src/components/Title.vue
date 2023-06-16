<template>
    <h2><a v-if="backbtn"><IconBack @click="$router.go(-1)" /></a><span>{{ title }}</span></h2>
</template>

<script setup>
import IconBack from './icons/IconBack.vue'
defineProps(['title','backbtn'])
</script>

<style scoped>
h2 {
  padding: .7rem 1rem;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  position: sticky;
  top: 0;
  backdrop-filter: blur(10px);
}
h2 span {
  font-size: 20px;
  font-weight: bold;
  color: #000;
}
h2 a {
  display: flex;
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;
  margin:0 25px 0 -7px;
  cursor: pointer;
  border-radius: 50%;
}
</style>