<script setup>
import '../assets/form.css'
import { onMounted, ref, getCurrentInstance } from 'vue';
import Title from '../components/Title.vue'
import Button from '../components/Button.vue'
import { loadSettings, loadSession } from '../lln'

const settings = ref()
const session = ref()
const { proxy } = getCurrentInstance()

onMounted(async () => {
  settings.value = await loadSettings()
  session.value = loadSession()
})

async function saveSettings() {
  try {
    await proxy.$lln.misc.saveSettings(settings.value, session.value)
    proxy.$toast(proxy.$t('tips.success'), { type: 'success' })
  } catch (e) {
    if (e.code == 403 || e.code == 401) {
      proxy.$router.push('logout')
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
}

</script>
<template>
  <main>
    <Title :title="$t('nav.admin')" />
    <div class="formarea" v-if="settings">
      <div class="line">
        <div class="key">服务条款</div>
        <div class="value"><input placeholder="相对链接" type="text" v-model="settings.termsOfService" /></div>
      </div>
      <div class="line">
        <div class="key">隐私政策</div>
        <div class="value"><input placeholder="相对链接" type="text" v-model="settings.privacyPolicy" /></div>
      </div>
      <div class="line">
        <Button @click.stop="saveSettings" :btn="$t('btn.save')" />
      </div>
    </div>
  </main>
</template>
<style scoped>
main .area1 {
  padding: 2px 15px;
}
</style>
