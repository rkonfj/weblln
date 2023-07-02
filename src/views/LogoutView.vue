<script setup>
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import { getCurrentInstance, onMounted } from 'vue'

import lln from '../lln'

const { proxy } = getCurrentInstance()

onMounted(async () => {
  try {
    await proxy.$lln.user.logout(lln.loadSession())
  } catch (_) { }
  window.localStorage.removeItem('session')
  window.location.href = '/'
})
</script>
<template>
  <main>
    <Title :title="$t('nav.logout')" />
    <Loading />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid var(--lln-color-border);
  border-right: 1px solid var(--lln-color-border);
}
</style>