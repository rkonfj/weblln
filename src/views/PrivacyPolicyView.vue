<script setup>
import Title from '../components/Title.vue'
</script>
<template>
    <main>
      <Title :title="$t('nav.privacypolicy')" />
      <div class="empty">稍等片刻</div>
    </main>
</template>

<style scoped>
main .empty {
  padding: 2px 15px;
}
</style>