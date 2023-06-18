<script setup>
import { onMounted, ref, watch } from 'vue';
import CommentIcon from './icons/IconComment.vue'
import DefaultAvatarIcon from './icons/DefaultAvatarIcon.vue'
import ErrorIcon from './icons/ErrorIcon.vue'
import LikeIcon from './icons/IconLike.vue'
import moment from 'moment'

const emit = defineEmits(['shouldLogin', 'imagesReady'])
const props = defineProps(['status', 'timeline'])
const session = ref()
const avatar = ref()
const images = ref([])
const error = ref()

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  const image = new Image()
  image.src = props.status.user.picture
  image.onload = () => {
    avatar.value = image.src
  }
  for (let c of props.status.content) {
    if (c.type == 'img') {
      let img = new Image()
      img.src = c.value
      img.onload = () => {
        images.value.push(c.value)
        emit('imagesReady', {
          imgs: images.value,
          err: error.value
        })
      }
      img.onerror = () => {
        error.value = true
      }
    }
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
  if (!props.status.liked) {
    props.status.likeCount--
  } else {
    props.status.likeCount++
  }
}
</script>
<template>
  <div class="avatararea">
    <RouterLink @click.stop :to="`/${status.user.uniqueName}`" class="avatar">
      <img v-if="avatar" class="avatarimg" :src="status.user.picture" alt="avatar" />
      <DefaultAvatarIcon class="avatarimg" v-else />
    </RouterLink>
    <div v-if="timeline" class="timeline"></div>
  </div>
  <div class="content">
    <div class="author">
      <RouterLink @click.stop :to="`/${status.user.uniqueName}`">{{ status.user.name }}</RouterLink>
      <span>@{{ status.user.uniqueName }}</span>
      · {{ moment.duration(moment().diff(moment(status.createTime))).humanize() }}
    </div>
    <div class="raw">
      <div class="sf" v-for="c in status.content">
        <p v-if="c.type === 'text'">{{ c.value }}</p>
      </div>
      <div class="sf" v-if="error">
        <ErrorIcon class="icon" />
        <span class="error">一些图片没有加载成功</span>
      </div>
      <div class="media" v-if="images.length > 0">
        <div v-if="images.length == 1" class="image w50 h100"><img
            @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/1`)" :src="images[0]"
            alt="Image" /></div>
        <div v-if="images.length == 2" class="image w50 h100"><img
            @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/1`)" :src="images[0]"
            alt="Image" /></div>
        <div v-if="images.length == 2" class="image w50 h100"><img
            @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/2`)" :src="images[1]"
            alt="Image" /></div>

        <div v-if="images.length == 3" class="image w50 h100"><img
            @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/1`)" :src="images[0]"
            alt="Image" /></div>
        <div v-if="images.length == 3" class="fc">
          <div class="image h50"><img @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/2`)"
              :src="images[1]" alt="Image" /></div>
          <div class="image h50"><img @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/3`)"
              :src="images[2]" alt="Image" /></div>
        </div>
        <div v-if="images.length == 4" class="fc">
          <div class="image h50"><img @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/1`)"
              :src="images[0]" alt="Image" /></div>
          <div class="image h50"><img @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/2`)"
              :src="images[1]" alt="Image" /></div>
        </div>
        <div v-if="images.length == 4" class="fc">
          <div class="image h50"><img @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/3`)"
              :src="images[2]" alt="Image" /></div>
          <div class="image h50"><img @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/4`)"
              :src="images[3]" alt="Image" /></div>
        </div>
      </div>
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
.avatar .avatarimg {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.avatar svg {
  width: 40px;
  height: 40px;
}

.content {
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  flex: 1;
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

.content .raw {
  display: flex;
  flex-direction: column;
}

.content .sf {
  display: flex;
  align-items: center;
}

.content .sf .icon {
  width: 18px;
  height: 18px;
}

.content .sf .error {
  color: red;
  margin-left: 5px;
  font-size: 13px;
}

.content .media {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  margin: 10px 0;
  width: auto;
}

.content .media .fc {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  width: 0;
  margin-right: 5px;
}

.content .media .fc .h50:first-child {
  margin-bottom: 5px;
}

.content .media .image {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 15px;
  flex: 1;
  width: 0;
  border: 1px solid #bbb;
  box-sizing: content-box;
}

.content .media .w50 {
  margin-right: 5px;
}

.content .media .h50 img {
  min-height: 120px;
  max-height: 280px;
}

.content .media .h50 {
  width: auto;
}

.content .media .h100 img {
  min-height: 240px;
  max-height: 564px;
}


.content .media img {
  flex-grow: 1;
  min-height: 240px;
}

@media (max-width: 60rem) {
  .content .media img, .content .media .h100 img {
    min-height: 100px;
    max-height: 309px;
  }

  .content .media .h50 img {
    min-height: 50px;
    max-height: 152px;
  }
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
