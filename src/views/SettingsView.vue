<script setup>
import Title from '../components/Title.vue'
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const { locale } = useI18n()
watch(locale, lang => localStorage.setItem('lang', lang))

</script>
<template>
  <main>
    <Title :title="$t('nav.settings')" />
    <div class="language">
      <span>{{ $t('nav.lang') }}</span><select v-model="$i18n.locale">
        <option value="zh">简体中文</option>
        <option value="en">English</option>
      </select>
    </div>
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}

.language {
  padding: 10px 15px;
}
.language span {
  margin-right: 10px;
}
</style>