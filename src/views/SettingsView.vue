<script setup>
import Title from '../components/Title.vue'
import Button from '../components/Button.vue'

import { useI18n } from 'vue-i18n'
import { watch, onMounted, ref, inject } from 'vue'
import { Settings } from 'luxon'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const session = ref()
const { t, locale } = useI18n()
const router = useRouter()
let llnApi = ""

watch(locale, lang => {
  localStorage.setItem('lang', lang)
  Settings.defaultLocale = lang
})

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
})

async function modifyProfile() {
  let resp = await fetch(`${llnApi}/i/profile`, {
    method: 'PUT',
    headers: {
      "Authorization": session.value.apiKey,
    },
    body: JSON.stringify({
      name: session.value.name,
      uniqueName: session.value.uniqueName
    })
  })
  if (resp.status != 200) {
    toast(await resp.text(), { type: 'error' })
    return
  }
  toast(t('tips.success'), { type: 'success' })
  setTimeout(() => router.push('/logout'), 1000)
}

</script>
<template>
  <main>
    <Title :title="$t('nav.settings')" />
    <div class="user" v-if="session">
      <div class="avatar" @click="toast('暂不支持修改头像', { type: 'warning' })">
        <img :src="session.picture" alt="avatar" />
      </div>
      <div class="line">
        <div class="key">{{ $t('user.name') }}</div>
        <div class="value"><input type="text" v-model="session.name" /></div>
      </div>
      <div class="line">
        <div class="key">{{ $t('user.idname') }}</div>
        <div class="value"><input type="text" v-model="session.uniqueName" /></div>
      </div>
      <div class="line saveProfile">
        <span class="tips">{{ $t('user.exittips') }}</span>
        <Button class="save" @click="modifyProfile" :btn="$t('btn.save')" />
      </div>
    </div>
    <div class="language">
      <div class="line">
        <div class="key">{{ $t('nav.lang') }}</div>
        <div class="value">
          <select v-model="$i18n.locale">
            <option value="zh">简体中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid var(--lln-color-border);
  border-right: 1px solid var(--lln-color-border);
}

.user {
  padding: 10px 15px;
  border-bottom: 1px solid var(--lln-color-border);
}

.line {
  display: flex;
  height: 38px;
  line-height: 38px;
  justify-content: space-between;
  align-items: center;
}

.key {
  flex: 0 0 80px;
  display: inline-block;
  font-weight: bold;
  padding: 0 10px 0 0;
  color: var(--lln-color-text);
}

.value {
  flex: 1;
}

select,
.user .value input {
  padding: 5px 10px;
  line-height: 22px;
  width: 100%;
  border: 1px solid var(--lln-color-timeline);
  outline-color: hsla(160, 100%, 37%, 1);
  font-size: 16px;
  border-radius: 16px;
  background-color: var(--color-background);
  color: var(--lln-color-text);
}

.user .saveProfile {
  margin: 10px 0 20px 0;
}

.user .saveProfile .save {
  line-height: 24px;
}

.user button:hover {
  background-color: rgb(0, 0, 0, 0.6);
}

.user .avatar {
  margin-bottom: 20px;
  width: 80px;
  height: 80px;
}

.user .avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
}

option {
  padding: 10px;
}

.language {
  padding: 10px 15px;
}

.language span {
  margin-right: 10px;
}

.tips {
  font-size: 14px;
  color: rgb(113, 119, 121);
}

@media (prefers-color-scheme: dark) {
  .user button {
    background-color: var(--lln-color-side-bg);
  }
}
</style>