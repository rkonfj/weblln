<script setup>
import Title from '../components/Title.vue'
</script>
<template>
    <main>
      <Title :title="$t('nav.termsofservice')" />
    </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}
</style>