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
  border-left: 1px solid var(--lln-color-border);
  border-right: 1px solid var(--lln-color-border);
}
</style>
