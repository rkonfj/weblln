<script setup>
import Title from '../components/Title.vue'
</script>
<template>
    <main>
      <Title title="消息" />
    </main>
</template>

<style scoped>
h2 {
  font-size: 20px;
  font-weight: bold;
  padding: 10px 20px;
  display: block;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  position: sticky;
  top: 0;
  backdrop-filter: blur(10px);
}
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}
</style>