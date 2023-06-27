<script setup>
import { inject, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { DateTime } from 'luxon'
import lln from '../lln'

import CommentIcon from './icons/IconComment.vue'
import DefaultAvatarIcon from './icons/DefaultAvatarIcon.vue'
import ErrorIcon from './icons/ErrorIcon.vue'
import LikeIcon from './icons/IconLike.vue'
import LikedIcon from './icons/LikedIcon.vue'
import LoadingIcon from './icons/LoadingIcon.vue'

const emit = defineEmits(['shouldLogin', 'imagesReady'])
const props = defineProps(['status', 'timeline', 'hideMedia', 'simple'])
const session = ref()
const avatar = ref()
const images = ref([])
const paragraphs = ref([])
const error = ref()
const imageCount = ref(0)
const imageErrCount = ref(0)
const imageLoadCount = ref(0)
let llnApi = ""

onMounted(() => {
  let sessionStr = window.localStorage.getItem("session")
  if (sessionStr) {
    session.value = JSON.parse(sessionStr)
  }
  llnApi = inject('llnApi')
  const image = new Image()
  image.src = props.status.user.picture
  image.onload = () => {
    avatar.value = image.src
  }
  for (let c of props.status.content) {
    if (c.type == 'img') {
      (function (idx) {
        let img = new Image()
        img.src = c.value
        img.onload = () => {
          images.value[idx] = c.value
          emit('imagesReady', {
            imgs: images.value,
            imgCount: imageCount.value,
            imgLoadCount: imageLoadCount.value,
            imgErrCount: imageErrCount.value
          })
          imageLoadCount.value++
        }
        img.onerror = () => {
          error.value = true
          imageErrCount.value++
        }
      })(imageCount.value)
      imageCount.value++
    } else {
      paragraphs.value.push(c.value)
    }
  }
})

async function likeStatus() {
  if (!session.value) {
    emit('shouldLogin')
    return
  }
  let resp = await fetch(`${llnApi}/i/like/status/${props.status.id}`, {
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
      <span v-if="!simple">
        · {{ DateTime.fromISO(status.createTime).toRelative() }}
      </span>
    </div>
    <div v-if="status.prev && status.prev.user" class="replyflag">
      {{ $t('status.replying') }} <RouterLink @click.stop :to="`/${status.prev.user.uniqueName}`">@{{
        status.prev.user.uniqueName }}</RouterLink>
    </div>
    <div class="raw">
      <div class="sf" v-if="simple" v-for="c in paragraphs">
        <p class="paragraph" v-html="lln.renderText(c)"></p>
      </div>
      <div v-if="!simple && paragraphs.length > 0">
        <div>
          <span v-html="lln.renderText(paragraphs[0])"></span>
          <span v-if="paragraphs.length > 1">...<a class="showMore">{{ $t('status.showmore') }}</a></span>
        </div>
      </div>
      <div class="sf" v-if="imageErrCount > 0">
        <ErrorIcon class="icon" />
        <span class="error">{{ imageErrCount }} 张图片没有加载成功</span>
      </div>
      <div class="sf" v-if="imageCount > 0 && imageLoadCount + imageErrCount < imageCount">
        <LoadingIcon class="icon" />
        <span class="tips">{{ imageCount - imageLoadCount - imageErrCount }} 张图片正在加载</span>
      </div>
      <div class="media" v-if="images.length > 0 && !hideMedia">
        <div v-if="images.length == 1" class="image"><img
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
    <div class="op" v-if="!simple">
      <a>
        <div class="icon">
          <CommentIcon />
        </div><span>{{ status.comments }}</span>
      </a>
      <a @click.stop="likeStatus">
        <div class="icon">
          <LikeIcon v-if="!status.liked" />
          <LikedIcon class="like" v-if="status.liked" />
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
  min-width: 0;
}

.content .author {
  line-height: 16px;
  margin-bottom: 5px;
}

.content .author span {
  color: rgb(83, 100, 113);
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

.content .replyflag {
  color: rgb(83, 100, 113);
}

.content .raw {
  display: flex;
  flex-direction: column;
}

.content .raw .paragraph {
  margin-bottom: 15px;
  word-break: break-all;
  width: 100%;
}

.content .sf {
  display: flex;
  align-items: center;
}

.content .showMore {
  margin-left: 2px;
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

.content .sf .tips {
  color: #bbb;
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
  min-width: min-content;
  border: 1px solid #bbb;
  box-sizing: content-box;
}

.content .media .w50 {
  margin-right: 5px;
}

.content .media .h50 img {
  min-height: 40px;
  max-height: 200px;
}

.content .media .h50 {
  width: auto;
}

.content .media .h100 img {
  min-height: 80px;
  max-height: 400px;
}


.content .media img {
  min-height: 80px;
  max-height: 566px;
  max-width: 100%;
}

@media (max-width: 60rem) {
  .content .media img {
    min-height: 60px;
    max-height: 300px;
  }

  .content .media .h100 img {
    min-height: 40px;
    max-height: 200px;
  }

  .content .media .h50 img {
    min-height: 20px;
    max-height: 97px;
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

.content .op a .icon svg {
  width: 18px;
  height: 18px;
}

.content .op a .like {
  fill: #d6204b;
}
</style>
