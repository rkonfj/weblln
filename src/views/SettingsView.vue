<script setup>
import Title from '../components/Title.vue'
import { useI18n } from 'vue-i18n'
import { watch, onMounted, ref, inject } from 'vue'
import { useRouter } from 'vue-router';

const session = ref()
const { locale } = useI18n()
const router = useRouter()
let llnApi = ""
watch(locale, lang => localStorage.setItem('lang', lang))

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
})

async function changeName(name,uniqueName) {
  let resp = await fetch(`${llnApi}/i/name?name=${name}&uniqueName=${uniqueName}`, {
    method: 'PUT',
    headers: {
      "Authorization": session.value.apiKey,
    }
  })
  if(resp.status != 200) {
    alert(await resp.text())
    return
  }
  router.push('/explore')
}

</script>
<template>
  <main>
    <Title :title="$t('nav.settings')" />
    <div class="user" v-if="session">
      ID：{{ session.id }} <br />
      显示名：<input type="text" v-model="session.name" /> <button @click="changeName(session.name, '')">更新</button> <br />
      用户名：<input type="text" v-model="session.uniqueName" /> <button @click="changeName('', session.uniqueName)">更新</button>
    </div>
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

.user {
  padding: 10px 15px;
  border-bottom: 1px solid rgb(239, 243, 244);
}

.language {
  padding: 10px 15px;
}

.language span {
  margin-right: 10px;
}
</style>