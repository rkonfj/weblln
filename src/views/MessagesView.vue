<script setup>
import { onMounted, ref, getCurrentInstance } from 'vue'
import { DateTime } from 'luxon'
import lln from '../lln'

import Title from '../components/Title.vue'
import NoMsgIcon from '../components/icons/IconNoMsg.vue'
import Loading from '../components/Loading.vue'

const emit = defineEmits(['tipsDeleted'])
const { proxy } = getCurrentInstance()
const session = ref()
const loading = ref(true)
const haveMore = ref()
const messages = ref([])

onMounted(async () => {
  session.value = lln.loadSession()
  loadMessages()
})

async function loadMessages(after) {
  loading.value = true
  try {
    let resp = await proxy.$lln.message.listMessages(after, 20, session.value)
    haveMore.value = resp.more
    deleteTipMessages(resp.v)
    if (resp.v != null) {
      for (let s of resp.v) {
        messages.value.push(s)
      }
    }
  } catch (e) {
    if (e.code == 401) {
      proxy.$toast(proxy.$t('tips.sessionExpired', { type: 'error' }))
      setTimeout(proxy.$router.push('/logout'), 1000)
      return
    }
    proxy.$toast(e.message, { type: 'error' })
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
    for (let m of msgs) {
      if (tips.includes(m.id)) {
        shouldDeletes.push(m.id)
      }
    }
    await proxy.$lln.message.deleteTipMessages(shouldDeletes, session.value)
    emit('tipsDeleted')
  }
}

async function deleteMessages() {
  let msgs = []
  for (let msg of messages.value) {
    msgs.push(msg.id)
  }
  try {
    await proxy.$lln.message.deleteMessages(msgs, session.value)
    proxy.$toast(proxy.$t('tips.success'), { type: 'success' })
    messages.value = []
    loadMessages()
  } catch (e) {
    proxy.$toast(e.message, { type: 'error' })
  }
}

function tipsMsg(id) {
  let tips = JSON.parse(window.localStorage.getItem('tips'))
  if (!tips) {
    return false
  }
  return tips.includes(id)
}
</script>
<template>
  <main>
    <Title :title="$t('nav.messages')" />
    <ul>
      <li v-for="msg in messages" :class="`${tipsMsg(msg.id) ? 'active' : ''}`">
        <span v-if="!['at', 'follow'].includes(msg.type)">
          你发布的 <RouterLink :to="`/${session.uniqueName}/status/${msg.targetID}`">
            /status/{{ msg.targetID }}</RouterLink> 收到了来自 <RouterLink :to="`/${msg.from.uniqueName}`">
            {{ msg.from.uniqueName === session.uniqueName ? '自己' : msg.from.name }}</RouterLink>的{{ renderAction(msg.type)
            }}
        </span>
        <span v-if="msg.type == 'at'">
          主题<RouterLink :to="`/${msg.from.uniqueName}/status/${msg.targetID}`">
            /{{ msg.from.uniqueName }}/status/{{ msg.targetID }}</RouterLink>中提到了你
        </span>
        <span v-if="msg.type == 'follow'">
          新粉丝！<RouterLink :to="`/${msg.from.uniqueName}`">
            {{ msg.from.uniqueName === session.uniqueName ? '自己' : msg.from.name }}</RouterLink>关注了你
        </span>
        <span class="time" v-if="msg.createTime"> · {{ DateTime.fromISO(msg.createTime).toRelative()
        }}</span>
      </li>
    </ul>
    <div class="op">
      <div class="btn" v-if="haveMore && !loading"
        @click="loadMessages(messages[messages.length - 1].createRev)">
        加载更多
      </div>
      <div class="btn del" v-if="messages.length > 0" @click="deleteMessages">
        删除已加载
      </div>
    </div>
    <Loading v-if="loading" />
    <div v-if="messages.length == 0 && !loading" class="empty">
      <NoMsgIcon />
    </div>
  </main>
</template>

<style scoped>
main .op .btn,
main ul li {
  padding: 10px 15px;
  transition: .5s, disply 0.5s;
  border-bottom: 1px solid var(--lln-color-border);
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

main .op {
  display: flex;
}

main .op .btn {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: hsla(160, 100%, 37%, 1);
}

main .op .btn:hover {
  background-color: var(--lln-color-bg-hover);
  cursor: pointer;
}

main .op .del {
  color: red;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
}
</style>