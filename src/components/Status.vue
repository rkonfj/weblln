<script setup>
import CommentIcon from './icons/IconComment.vue'
import LikeIcon from './icons/IconLike.vue'
import moment from 'moment'
defineProps(['status'])
</script>
<template>
    <div class="avatararea">
        <a :href="'/' + status.user.uniqueName" class="avatar"><img :src="status.user.picture" alt="avatar" /></a>
    </div>
    <div class="content">
        <div class="author">
            <a :href="'/' + status.user.uniqueName">{{ status.user.name }}</a>
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
                </div><span>544</span>
            </a>
        <a>
            <div class="icon">
                <LikeIcon />
            </div><span>7.2万</span>
        </a>
    </div>
</div></template>
<style scoped>
.avatar, .avatar img {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.content {
  padding: 0 10px;
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
  background-color: rgba(29, 155, 240,0.1);
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
