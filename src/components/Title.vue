<template>
  <h2>
    <a v-if="backbtn" @click="$router.go(-1)">
      <IconBack />
    </a>
    <div class="block">
      <div v-if="tips" class="title tipstitle">{{ title }}</div>
      <div v-if="!tips" class="title">{{ title }}</div>
      <div v-if="tips" class="tips">{{ tips }}</div>
    </div>
  </h2>
</template>

<script setup>
import IconBack from './icons/IconBack.vue'
import { ref } from 'vue'
defineProps(['title', 'backbtn', 'tips'])
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
  z-index: 20;
}

h2 .block {
  display: block;
}

h2 .title {
  font-size: 20px;
  font-weight: bold;
  width: 100%;
  color: var(--lln-color-text);
}


h2 .tipstitle {
  font-size: 20px;
  line-height: 18px;
  margin-top: 9px;
}

h2 .tips {
  width: 100%;
  font-size: 13px;
  color: #666;
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

  h2 .title,
  h2 .tipstitle {
    font-size: 16px;
  }
}
</style>