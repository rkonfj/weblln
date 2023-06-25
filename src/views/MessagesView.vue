<script setup>
import { onMounted, ref, inject } from 'vue'
import moment from 'moment'
import Title from '../components/Title.vue'
import NoMsgIcon from '../components/icons/IconNoMsg.vue'
import Loading from '../components/Loadding.vue'

const emit = defineEmits(['tipsDeleted'])
const session = ref()
const loading = ref()
const haveMore = ref()
const messages = ref()
let llnApi = ""

onMounted(async () => {
  llnApi = inject('llnApi')
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  loadMessages()
})

async function loadMessages(after) {
  loading.value = true
  let opts = {}
  if (session.value) {
    opts.headers = {
      "Authorization": session.value.apiKey,
    }
  }
  let afterQuery = ''
  if (after) {
    afterQuery = '&after=' + after
  }
  let resp = await fetch(`${llnApi}/i/messages?size=20${afterQuery}`, opts)
  if (resp.headers.get("X-Session-Valid") == "false") {
    session.value = null
  }
  let msgs = await resp.json()
  deleteTipMessages(msgs)
  if (!after) {
    messages.value = []
    if (msgs != null) {
      messages.value = msgs
    }
  } else {
    if (ss != null) {
      for (let s of msgs) {
        messages.value.push(s)
      }
    } else {
      haveMore.value = false
    }
  }
  loading.value = false
}

function renderAction(t) {
  if (t === "like") {
    return "点赞"
  }
  if (t === "comment") {
    return "评论"
  }
  if (t === "bookmark") {
    return "书签"
  }
}

async function deleteTipMessages(msgs) {
  let tips = JSON.parse(window.localStorage.getItem('tips'))
  if (tips) {
    let shouldDeletes = []
    for(let m of msgs) {
      if(tips.includes(m.id)) {
        shouldDeletes.push(m.id)
      }
    }
    await fetch(`${llnApi}/i/messages/tips`, {
      method: 'delete',
      headers: {
        "Authorization": session.value.apiKey,
      },
      body: JSON.stringify(shouldDeletes)
    })
    emit('tipsDeleted')
  }
}

function tipsMsg(id) {
  let tips = JSON.parse(window.localStorage.getItem('tips'))
  if(!tips) {
    return false
  }
  return tips.includes(id)
}
</script>
<template>
  <main>
    <Title :title="$t('nav.messages')" />
    <ul>
      <li v-for="msg in messages" :class="`${tipsMsg(msg.id)?'active':''}`">
        你发布的 <RouterLink :to="`/${session.uniqueName}/status/${msg.targetID}`">
          /status/{{ msg.targetID }}</RouterLink> 收到了来自 <RouterLink :to="`/${msg.from.uniqueName}`">
          {{ msg.from.uniqueName === session.uniqueName ? '自己' : msg.from.name }}</RouterLink>的{{ renderAction(msg.type)
          }}
        <span class="time" v-if="msg.createTime"> · {{ moment.duration(moment().diff(moment(msg.createTime))).humanize()
        }}</span>
      </li>
    </ul>
    <div class="loadbtn" v-if="messages && messages.length > 0 && messages.length % 12 == 0 && haveMore"
      @click="loadMessages(messages[messages.length - 1].id)">
      加载更多
    </div>
    <Loading v-if="!messages || loading" />
    <div v-if="messages && messages.length == 0" class="empty">
      <NoMsgIcon />
    </div>
  </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}

main ul li {
  display: flex;
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid rgb(239, 243, 244);
}

main ul li a {
  padding: 0 5px;
}

main ul .active {
  background-color: hsla(160, 100%, 37%, 0.1);
}

main ul li .time {
  padding: 0 5px;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
}
</style>