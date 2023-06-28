<script setup>
import Title from '../components/Title.vue'
import { useI18n } from 'vue-i18n'
import { watch, onMounted, ref, inject } from 'vue'
import { Settings } from 'luxon'
import { useRouter } from 'vue-router';

const session = ref()
const { locale } = useI18n()
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

async function changeName(name, uniqueName) {
  let resp = await fetch(`${llnApi}/i/name?name=${name}&uniqueName=${uniqueName}`, {
    method: 'PUT',
    headers: {
      "Authorization": session.value.apiKey,
    }
  })
  if (resp.status != 200) {
    alert(await resp.text())
    return
  }
  router.push('/logout')
}

</script>
<template>
  <main>
    <Title :title="$t('nav.settings')" />
    <div class="user" v-if="session">
      <div class="line">
        <div class="key">ID</div>
        <div class="value">{{ session.id }}</div>
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
        <button @click="changeName(session.name, session.uniqueName)"
          :style="$i18n.locale === 'en' ? 'letter-spacing: normal' : ''">{{ $t('btn.save') }}</button>
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
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}

.user {
  padding: 10px 15px;
  border-bottom: 1px solid rgb(239, 243, 244);
}

.line {
  display: flex;
  height: 36px;
  line-height: 36px;
  justify-content: right;
  align-items: center;
}

.key {
  flex: 0 0 80px;
  display: inline-block;
  font-weight: bold;
  padding: 0 10px 0 0;
}

.value {
  flex: 1;
}

select,
.user .value input {
  padding: 6px 10px;
  width: 100%;
  border: 1px solid rgb(207, 217, 222);
  outline-color: hsla(160, 100%, 37%, 1);
  font-size: 16px;
  border-radius: 5px;
}

.user button {
  user-select: none;
  display: inline-block;
  border: none;
  background-color: #222;
  font-size: 15px;
  font-weight: bold;
  padding: 0.4rem 1rem 0.4rem 1.2rem;
  color: #fff;
  border-radius: 22px;
  letter-spacing: 0.2rem;
  transition: 0.4s;
  cursor: pointer;
}

.user .saveProfile {
  margin: 10px 0 20px 0;
}

.user button:hover {
  background-color: rgb(0, 0, 0, 0.7);
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
  margin: 0 10px;
  font-size: 14px;
  color: #666;
}
</style>