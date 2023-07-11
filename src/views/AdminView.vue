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

function addFriend(i) {
  let friend = {
    logo: '',
    title: '',
    url: '',
    desc: ''
  }
  if (i >=0 ) {
    settings.value.friends.splice(i, 0, friend)
    console.log(JSON.stringify(settings.value.friends))
    return
  }
  settings.value.friends.push(friend)
}

function deleteFriend(i) {
  settings.value.friends.splice(i, 1)
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
        <div class="key">公告</div>
        <div class="value">
          <textarea rows="5" v-model="settings.announcement" />
        </div>
      </div>
      <div class="line">
        <div class="key">{{ $t('nav.friends') }}</div>
        <div class="value"><a class="opbtn" @click="addFriend">新增</a></div>
      </div>
      <ul>
        <li v-for="(item, i) in settings.friends">
          <div class="line">
            <input type="text" v-model="item.logo" placeholder="Logo" />
          </div>
          <div class="line">
            <input type="text" v-model="item.title" placeholder="Title" />
          </div>
          <div class="line">
            <input type="text" v-model="item.url" placeholder="URL" />
          </div>
          <div class="line">
            <input type="text" v-model="item.desc" placeholder="Description" />
          </div>
          <a class="opbtn" @click="deleteFriend(i)">删除</a> <a class="opbtn" @click="addFriend(i)">新增</a>
        </li>
      </ul>
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

main .opbtn {
  cursor: pointer;
}

main ul li {
  padding: 10px 0;
  transition: .5s;
  border-bottom: 1px solid var(--lln-color-border);
}
</style>
