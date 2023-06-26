<script setup>
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
window.localStorage.removeItem('session')
window.location.href = '/'
</script>
<template>
  <main>
    <Title :title="$t('nav.logout')" />
    <Loading />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}
</style>