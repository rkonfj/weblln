<script setup>
import Title from '../components/Title.vue'
import Button from '../components/Button.vue'
import Avatar from '../components/Avatar.vue'
import ProfileBgImage from '../components/ProfileBgImage.vue'
import PictureEditIcon from '../components/icons/PictureEditIcon.vue'
import Toggle from '@vueform/toggle'

import { useI18n } from 'vue-i18n'
import { watch, onMounted, ref, getCurrentInstance } from 'vue'
import { Settings } from 'luxon'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { llnApi } from '../config'

const session = ref()
const { t, locale } = useI18n()
const { proxy } = getCurrentInstance()
const router = useRouter()
const imageAutoload = ref(true)
const fileHandler = ref()

watch(locale, lang => {
  localStorage.setItem('lang', lang)
  Settings.defaultLocale = lang
})

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  imageAutoload.value = !JSON.parse(localStorage.getItem('hideImages'))
})

async function modifyProfile() {
  let resp = await fetch(`${llnApi}/i/profile`, {
    method: 'PUT',
    headers: {
      "Authorization": session.value.apiKey,
    },
    body: JSON.stringify({
      picture: session.value.picture,
      bg: session.value.bg,
      name: session.value.name,
      uniqueName: session.value.uniqueName,
      bio: session.value.bio
    })
  })
  if (resp.status != 200) {
    toast(await resp.text(), { type: 'error' })
    return
  }
  toast(t('tips.success'), { type: 'success' })
  setTimeout(() => router.push('/logout'), 1000)
}

function setImageAutoload(v) {
  localStorage.setItem('hideImages', !v)
}

let ep = null

async function uploadFile(event) {
  if (event.target.files.length == 0) {
    proxy.$toast('取消上传', { type: 'error' })
    return
  }
  let f = event.target.files[0]
  try {
    proxy.$toast('正在上传')
    let resp = await proxy.$lln.misc.uploadFile(f, session.value)
    proxy.$toast(proxy.$t('tips.success'), { type: 'success' })
    session.value[ep] = resp.path
  } catch (e) {
    if (e.code == 401) {
      proxy.$toast('401', { type: 'error' })
      return
    }
    proxy.$toast(e.message, { type: 'error' })
  }
  fileHandler.value.value = null
}

function effectProp(prop) {
  ep = prop
}
</script>
<template>
  <main>
    <Title :title="$t('nav.settings')" />
    <input type="file" accept="image/*" style="display: none;" @change="uploadFile" ref="fileHandler" />
    <div class="bg" v-if="session">
      <div class="edit" @click="fileHandler.click(); effectProp('bg')">
        <PictureEditIcon />
      </div>
      <ProfileBgImage v-if="session" :src="session.bg" />
    </div>
    <div class="user" v-if="session">
      <div class="avatar">
        <div class="edit" @click="fileHandler.click(); effectProp('picture')">
          <PictureEditIcon />
        </div>
        <Avatar :src="session.picture" />
      </div>
      <div class="line">
        <div class="key">{{ $t('user.name') }}</div>
        <div class="value"><input type="text" v-model="session.name" /></div>
      </div>
      <div class="line">
        <div class="key">{{ $t('user.idname') }}</div>
        <div class="value"><input type="text" v-model="session.uniqueName" /></div>
      </div>
      <div class="line">
        <div class="key">{{ $t('user.bio') }}</div>
        <div class="value">
          <textarea class="bio" rows="2" v-model="session.bio"></textarea>
        </div>
      </div>
      <div class="line saveProfile">
        <span class="tips">{{ $t('user.exittips') }}</span>
        <Button class="save" @click="modifyProfile" :btn="$t('btn.save')" />
      </div>
    </div>
    <div class="language">
      <div class="line">
        <div class="key">{{ $t('tips.imageautoload') }}</div>
        <div class="value">
          <Toggle v-model="imageAutoload" @change="setImageAutoload" />
        </div>
      </div>
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

<style src="@vueform/toggle/themes/default.css"></style>

<style scoped>
.bg {
  position: relative;
  width: 100%;
  aspect-ratio: 3/1;
  background-color: var(--lln-color-timeline);
}

.edit {
  color: rgb(255, 255, 255, 0.8);
  background-color: rgb(0, 0, 0, 0.6);
  border-radius: 50%;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 40px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}

.edit svg {
  width: 24px;
  height: 24px;
  fill: #fff;
}

.bg img {
  width: 100%;
  aspect-ratio: 3/1;
  margin-bottom: -5px;
  object-fit: cover;
}

.user {
  padding: 10px 15px;
  border-bottom: 1px solid var(--lln-color-border);
}

.line {
  display: flex;
  height: min-content;
  line-height: 18px;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  min-width: 0;
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
  min-width: 0;
}

textarea,
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
  font-family: inherit;
}

.bio {
  max-width: 100%;
  min-width: 100%;
  max-height: 120px;
  min-height: 120px;
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
  border: 1px solid var(--lln-color-border);
  border-radius: 50%;
  margin: -70px 0 20px 0px;
  width: 120px;
  height: 120px;
  position: relative;
}

.user .avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
}

option {
  padding: 10px;
}

.language {
  padding: 10px 15px;
  display: block;
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