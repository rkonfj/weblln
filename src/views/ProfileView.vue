<script setup>
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import Status from '../components/Status.vue'
import Button from '../components/Button.vue'
import CalendarIcon from '../components/icons/IconCalendar.vue'
import { ref, onMounted, inject, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import { DateTime } from 'luxon'
import { toast } from 'vue3-toastify'

const emit = defineEmits(['shouldLogin'])
const { proxy } = getCurrentInstance()
const route = useRoute()
const profile = ref()
const session = ref()
const status = ref([])
const loading = ref(true)
const haveMore = ref()
let llnApi = ""


onMounted(async () => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
  let opts = {}
  if (session.value) {
    opts.headers = {
      "Authorization": session.value.apiKey,
    }
  }
  let resp = await fetch(`${llnApi}/o/user/${route.params.uniqueName}`, opts)
  profile.value = await resp.json()
  loadStatus()
})

async function loadStatus(after) {
  loading.value = true
  try {
    let resp = await proxy.$lln.user.status(route.params.uniqueName, after, 12, session.value)
    haveMore.value = resp.more
    if (resp.v) {
      for (let s of resp.v) {
        status.value.push(s)
      }
    }
  } catch (e) {
    proxy.$toast(e.message, { type: 'error' })
  }
  loading.value = false
}

async function follow() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }

  let resp = await fetch(`${llnApi}/i/follow/user/${profile.value.uniqueName}`, {
    method: 'POST',
    headers: {
      "Authorization": session.value.apiKey,
    }
  })
  if (resp.status == 401) {
    toast('401')
    return
  }
  if (resp.status != 200) {
    toast(await resp.text())
    return
  }
  profile.value.following = !profile.value.following
  profile.value.following ? profile.value.followers++ : profile.value.followers--
}
</script>
<template>
  <main>
    <Title :title="profile ? profile.name : ''" backbtn="true"
      :tips="`${profile ? profile.tweets : 0} ${$t('tips.tweets')}`" />
    <div v-if="profile" class="mainarea">
      <div class="bg"></div>
      <div class="profile">
        <div class="op">
          <img class="avatar" :src="profile.picture" alt="avatar" />
        </div>
        <div class="info">
          <Button class="follow" v-if="!session || session.id != profile.id" @click="follow"
            :btn="session && profile.following ? $t('user.following') : $t('btn.follow')" />
          <div class="n">{{ profile.name }}</div>
          <div class="un">@{{ profile.uniqueName }}</div>
          <div class="bio" v-if="profile.bio && profile.bio.length > 0">{{ profile.bio }}</div>
          <div class="join">
            <CalendarIcon /><span>{{ DateTime.fromISO(profile.createTime).toRelative() }}</span>加入
          </div>
        </div>
        <div class="info">
          <div class="item">
            <a class="" @click="toast('暂不支持查看', { type: 'warning' })"><span>{{ profile.followings }}</span> {{
              $t('user.following') }}</a>
          </div>
          <div class="item">
            <a class="" @click="toast('暂不支持查看', { type: 'warning' })"><span>{{ profile.followers }}</span> {{
              $t('user.followers') }}</a>
          </div>
        </div>
      </div>
    </div>
    <ul>
      <li v-for="(s, i) in status" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status @shouldLogin="$emit('shouldLogin')" :key="s.id" @deleted="status.splice(i, 1)" :status="s" />
      </li>
    </ul>
    <div class="loadbtn" v-if="haveMore && !loading" @click="loadStatus(status[status.length - 1].id)">
      加载更多
    </div>
    <Loading v-if="!profile || loading" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid var(--lln-color-border);
  border-right: 1px solid var(--lln-color-border);
}

main ul {
  margin-top: 10px;
}

main .loadbtn,
main ul li {
  display: flex;
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid var(--lln-color-border);
}

main .loadbtn:hover,
main ul li:hover {
  background-color: var(--lln-color-bg-hover);
  cursor: pointer;
}

main .loadbtn {
  justify-content: center;
  align-items: center;
  color: hsla(160, 100%, 37%, 1);
}

.mainarea .bg {
  height: 200px;
  background-color: var(--lln-color-timeline);
}

.mainarea .avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  margin: -78px 0 0 20px;
  border: 5px solid #fff;
  display: flex;
  background-color: #fff;
}

.mainarea .info {
  padding: 3px 15px;
  position: relative;
}

.mainarea .info:last-child {
  margin-bottom: 15px;
}

.mainarea .info .item {
  display: inline-block;
  margin-right: 20px;
}

.mainarea .info .item a {
  color: rgb(83, 100, 113);
  font-size: 14px;
}

.mainarea .info .item a span {
  color: var(--lln-color-text);
  font-weight: bold;
}

.mainarea .info .item a:hover {
  background: none;
  text-decoration: underline;
  cursor: pointer;
}

.mainarea .follow {
  display: inline-block;
  position: absolute;
  top: -45px;
  right: 20px;
}

.mainarea .profile .bio {
  margin-top: 10px;
}

.mainarea .profile .n {
  font-size: 20px;
  font-weight: bold;
}

.mainarea .profile .un {
  font-size: 13px;
}

.mainarea .profile .join {
  display: flex;
  align-items: center;
  color: rgb(83, 100, 113);
  fill: rgb(83, 100, 113);
  margin: 6px 0 0 0;
}

.mainarea .profile .join span {
  margin: 0 10px 0 5px;
}

@media (max-width: 60rem) {
  main ul li:hover {
    background-color: unset;
  }
}
</style>