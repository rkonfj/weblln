<script setup>
import Title from '../components/Title.vue'
import Loadding from '../components/Loadding.vue'
import Status from '../components/Status.vue'
import CalendarIcon from '../components/icons/IconCalendar.vue'
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import moment from 'moment'

const route = useRoute()
const profile = ref()
const status = ref()
const loading = ref()
const haveMore = ref(true)
let llnApi = ""


onMounted(async () => {
  llnApi = inject('llnApi')
  let resp = await fetch(`${llnApi}/o/user/${route.params.uniqueName}`)
  profile.value = await resp.json()
  loadStatus()
})

async function loadStatus(after) {
  loading.value = true
  let afterQuery = ''
  if (after) {
    afterQuery = '&after=' + after
  }
  let resp = await fetch(`${llnApi}/o/user/${route.params.uniqueName}/status?size=12${afterQuery}`)
  let ss = await resp.json()
  if (!after) {
    status.value = []
    if (ss != null) {
      status.value = ss
    }
  } else {
    if (ss != null) {
      for (let s of ss) {
        status.value.push(s)
      }
    } else {
      haveMore.value = false
    }
  }
  loading.value = false
}

</script>
<template>
  <main>
    <Title :title="profile ? profile.name : ''" backbtn="true" />
    <div v-if="profile" class="mainarea">
      <div class="bg"></div>
      <div class="profile">
        <div class="op">
          <img class="avatar" :src="profile.picture" alt="avatar" />
        </div>
        <div class="info">
          <div class="n">{{ profile.name }}</div>
          <div class="un">@{{ profile.uniqueName }}</div>
          <div class="join">
            <CalendarIcon /><span>{{ moment.duration(moment().diff(moment(profile.createTime))).humanize() }}</span>加入
          </div>
        </div>
      </div>
    </div>
    <ul v-if="status">
      <li v-for="s in status" @click="$router.push(`/${s.user.uniqueName}/status/${s.id}`)">
        <Status @shouldLogin="$emit('shouldLogin')" :status="s" />
      </li>
    </ul>
    <div class="loadbtn" v-if="status && status.length > 0 && status.length % 12 == 0 && haveMore && !loading"
      @click="loadStatus(status[status.length - 1].id)">
      加载更多
    </div>
    <Loadding v-if="!profile || !status || loading" />
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}

main ul {
  margin-top: 10px;
}

main .loadbtn,
main ul li {
  display: flex;
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid rgb(239, 243, 244);
}

main .loadbtn:hover,
main ul li:hover {
  background-color: rgba(0, 0, 0, 0.03);
  cursor: pointer;
}

main .loadbtn {
  justify-content: center;
  align-items: center;
  color: hsla(160, 100%, 37%, 1);
}

.mainarea .bg {
  height: 200px;
  background-color: rgb(207, 217, 222);
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
  padding: 8px 15px;
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
</style>