<script setup>
import { onMounted, ref } from 'vue';
import CommentIcon from './icons/IconComment.vue'
import LikeIcon from './icons/IconLike.vue'
import moment from 'moment'

const emit = defineEmits(['shouldLogin'])
const props = defineProps(['status', 'timeline'])
const session = ref()

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
})

async function likeStatus() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  let resp = await fetch(`https://api.lowlevelnews.com/i/like/status/${props.status.id}`, {
    method: 'post',
    headers: {
      "Authorization": session.value.apiKey,
    }
  })
  if (resp.status == 401) {
    emit('shouldLogin')
    return
  }
  if (resp.status != 200) {
    alert(await resp.text())
    return
  }
  
  props.status.liked = !props.status.liked
  if(!props.status.liked) {
    props.status.likeCount--
  } else {
    props.status.likeCount++
  }
}
</script>
<template>
  <div class="avatararea">
    <RouterLink @click.stop :to="`/${status.user.uniqueName}`" class="avatar"><img :src="status.user.picture"
        alt="avatar" /></RouterLink>
    <div v-if="timeline" class="timeline"></div>
  </div>
  <div class="content">
    <div class="author">
      <RouterLink @click.stop :to="`/${status.user.uniqueName}`">{{ status.user.name }}</RouterLink>
      <span>@{{ status.user.uniqueName }}</span>
      · {{ moment.duration(moment().diff(moment(status.createTime))).humanize() }}
    </div>
    <div class="raw">
      <p v-for="c in status.content">{{ c.value }}</p>
    </div>
    <div class="op">
      <a>
        <div class="icon">
          <CommentIcon />
        </div><span>{{ status.comments }}</span>
      </a>
      <a @click.stop="likeStatus">
        <div class="icon">
          <LikeIcon />
        </div><span>{{ status.likeCount }}</span>
      </a>
    </div>
  </div>
</template>
<style scoped>
.avatararea {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatararea .timeline {
  display: flex;
  width: 2px;
  background-color: rgb(207, 217, 222);
  flex-grow: 1;
  min-height: calc(100% - 26px);
  margin-top: 3px;
}

.avatar,
.avatar img {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.content {
  padding: 0 10px;
}

.content .author {
  line-height: 16px;
  margin-bottom: 5px;
}

.content .author span {
  color: #666;
  margin-left: 10px;
}

.content .author a {
  color: #222;
  font-weight: bold;
}

.content .author a:hover {
  text-decoration: underline;
  text-decoration-color: #222;
  background: none;
}

.content .op {
  display: flex;
  margin: 5px 0 0 -6px;
}

.content .op a {
  display: flex;
  align-items: center;
  width: 80px;
}

.content .op a:hover {
  background: none;
  cursor: pointer;
}

.content .op a:hover .icon {
  background-color: rgba(29, 155, 240, 0.1);
  transition: 0.4s;
}

.content .op a:hover span {
  color: rgb(29, 155, 240);
}

.content .op a:hover .icon svg {
  fill: rgb(29, 155, 240);
}

.content .op a span {
  margin-left: 5px;
  font-size: 14px;
  color: rgb(83, 100, 113);
}

.content .op a .icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  width: 30px;
  border-radius: 50%;
}
</style>
