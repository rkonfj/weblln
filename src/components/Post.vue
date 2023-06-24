<script setup>
import MediaIcon from './icons/IconMedia.vue'
import DefaultAvatarIcon from './icons/DefaultAvatarIcon.vue'
import CloseIcon from './icons/CloseIcon.vue'
import { watchEffect, ref, onMounted, inject } from 'vue'

const props = defineProps(['placeholder', 'btntext', 'prevstatus'])
const emit = defineEmits(['posted'])

const sessionUniqueName = ref("")
const sessionPicture = ref("")
const activeClass = ref("")
const session = ref(null)
const contentRaw = ref("")
const textarea = ref("")
const images = ref([])
const mediaMode = ref()
const loadding = ref(false)
const avatar = ref("")
const progressColor = ref("hsla(160, 100%, 37%, 1)")
const progressC = ref(0)


let llnApi = ""

onMounted(() => {
    let sessionStr = window.localStorage.getItem("session")
    if (sessionStr) {
        let sessionObj = JSON.parse(sessionStr)
        session.value = sessionObj
        sessionUniqueName.value = sessionObj.uniqueName
        sessionPicture.value = sessionObj.picture
    }
    const image = new Image()
    image.src = sessionPicture.value
    image.onload = () => {
        avatar.value = image.src
    }
    llnApi = inject('llnApi')
})

watchEffect(() => {
    if (contentRaw.value.length > 0 || images.value.length > 0) {
        activeClass.value = "active"
    } else {
        activeClass.value = ""
    }
})

async function newStatus() {
    if (contentRaw.value.length == 0 && images.value.length == 0 || loadding.value) {
        return
    }
    loadding.value = true
    let content = []
    if (contentRaw.value.trim().length > 0) {
        content.push({
            type: 'text',
            value: contentRaw.value.trim()
        })
    }
    for (let img of images.value) {
        content.push({
            type: 'img',
            value: img
        })
    }
    let postBody = {
        content: content,
    }
    if (props.prevstatus) {
        postBody.prev = props.prevstatus
    }
    let resp = await fetch(`${llnApi}/i/status`, {
        method: 'post',
        headers: {
            "Authorization": session.value.apiKey,
        },
        body: JSON.stringify(postBody)
    })
    loadding.value = false
    if (resp.status == 200) {
        contentRaw.value = ''
        images.value = []
        emit('posted')
    } else if (resp.status == 401) {
        alert("401")
    } else {
        alert(await resp.text())
    }
}

function updateContentModel(e) {
    const paddingTop = parseInt(getComputedStyle(textarea.value).getPropertyValue(`padding-top`), 10)
    const paddingBottom = parseInt(getComputedStyle(textarea.value).getPropertyValue(`padding-bottom`), 10)
    const lineHeight = parseInt(getComputedStyle(textarea.value).getPropertyValue(`line-height`), 10)

    contentRaw.value = contentRaw.value.replace(/\n\n+/g, "\n\n")

    textarea.value.rows = 2

    const innerHeight = textarea.value.scrollHeight - paddingTop - paddingBottom
    textarea.value.rows = innerHeight / lineHeight

    progressC.value = contentRaw.value.length / 300 * 2 * Math.PI * 10

    if (contentRaw.value.length >= 300) {
        progressColor.value = 'red'
    } else {
        progressColor.value = 'hsla(160, 100%, 37%, 1)'
    }
}

function addMedia(e) {
    if (e.target.value.trim().length > 0) {
        images.value.push(e.target.value.trim())
        e.target.value = ''
        mediaMode.value = !mediaMode
    }
}

function removeMedia(idx) {
    images.value.splice(idx, 1)
}

</script>

<template>
    <div class="postarea">
        <div class="avatararea">
            <a class="avatar" :href="'/' + sessionUniqueName">
                <img :src="sessionPicture" alt="avatar" v-if="avatar" />
                <DefaultAvatarIcon class="avatarimg" v-else />
            </a>
        </div>
        <div class="content">
            <textarea class="raw" ref="textarea" rows="2" v-model="contentRaw" @dragover.prevent @drop="handleDragEnter"
                @paste="paseText" @input="updateContentModel" :placeholder="placeholder"></textarea>
            <div class="media" v-if="images.length > 0">
                <div v-if="images.length == 1" class="image">
                    <div class="close" @click="removeMedia(0)">
                        <CloseIcon />
                    </div><img :src="images[0]" alt="Image" />
                </div>
                <div v-if="images.length == 2" class="image w50 h100">
                    <div class="close" @click="removeMedia(0)">
                        <CloseIcon />
                    </div><img :src="images[0]" alt="Image" />
                </div>
                <div v-if="images.length == 2" class="image w50 h100">
                    <div class="close" @click="removeMedia(1)">
                        <CloseIcon />
                    </div><img :src="images[1]" alt="Image" />
                </div>

                <div v-if="images.length == 3" class="image w50 h100">
                    <div class="close" @click="removeMedia(0)">
                        <CloseIcon />
                    </div><img :src="images[0]" alt="Image" />
                </div>
                <div v-if="images.length == 3" class="fc">
                    <div class="image h50">
                        <div class="close" @click="removeMedia(1)">
                            <CloseIcon />
                        </div><img :src="images[1]" alt="Image" />
                    </div>
                    <div class="image h50">
                        <div class="close" @click="removeMedia(2)">
                            <CloseIcon />
                        </div><img :src="images[2]" alt="Image" />
                    </div>
                </div>
                <div v-if="images.length >= 4" class="fc">
                    <div class="image h50">
                        <div class="close" @click="removeMedia(0)">
                            <CloseIcon />
                        </div><img :src="images[0]" alt="Image" />
                    </div>
                    <div class="image h50">
                        <div class="close" @click="removeMedia(1)">
                            <CloseIcon />
                        </div><img :src="images[1]" alt="Image" />
                    </div>
                </div>
                <div v-if="images.length >= 4" class="fc">
                    <div class="image h50">
                        <div class="close" @click="removeMedia(2)">
                            <CloseIcon />
                        </div><img :src="images[2]" alt="Image" />
                    </div>
                    <div class="image h50">
                        <div class="close" @click="removeMedia(3)">
                            <CloseIcon />
                        </div><img :src="images[3]" alt="Image" />
                    </div>
                </div>
            </div>
            <div class="operate">
                <div class="func">
                    <a title="媒体" @click="mediaMode = !mediaMode">
                        <MediaIcon />
                    </a>
                    <input class="mediaAddress" type="text" v-if="mediaMode" placeholder="图片地址" @blur="addMedia" />
                </div>
                <div class="postbtn">
                    <svg class="progress" width="24" height="24" viewBox="0 0 24 24">
                        <circle class="progress-background" cx="12" cy="12" r="10" stroke="rgb(239, 243, 244)"
                            stroke-width="3" fill="none" />
                        <circle class="progress-fill" cx="12" cy="12" r="10" fill="none" :stroke="progressColor"
                            stroke-width="3" :stroke-dasharray="`${progressC},62.83`" />
                    </svg>
                    <button :class="activeClass" :style="$i18n.locale === 'en' ? 'letter-spacing: normal' : ''"
                        @click="newStatus()">{{ loadding ? "···" : btntext }}</button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.avatar,
.avatar img,
.avatar .avatarimg {
    display: inline-block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.postarea {
    display: flex;
    padding: 10px 15px;
    border-bottom: .5px solid rgb(239, 243, 244);
}

.avatararea {
    flex: 0 0 3.1rem;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
}


.content .media {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    margin: 10px 0;
}

.content .media .close {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: 0.4s;
    background-color: rgba(0, 0, 0, 0.2);
}

.content .media .close:hover {
    background-color: rgba(0, 0, 0, 0.8);
}

.content .media .close svg {
    fill: #fff;
    width: 18px;
    height: 18px;
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
    position: relative;
}

.content .media .w50 {
    margin-right: 5px;
    flex: 1;
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

.content .raw {
    width: 100%;
    min-height: 4.5rem;
    padding: 0.3rem 0 .5rem 0;
    outline: none;
    border: none;
    max-width: 100%;
    font-size: 18px;
    word-break: break-all;
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
        Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    resize: none;
}

.content [contenteditable=true]:empty:before {
    content: attr(placeholder);
    color: #536471;
    font-size: 18px;
}

.content .operate {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content .operate .postbtn {
    display: flex;
    align-items: center;
    justify-content: center;
}

.content .operate .progress {
    margin-right: 10px;
    transform: rotate(-90deg);
}

.content .operate .func {
    display: flex;
    flex: 1;
    justify-content: left;
    height: 36px;
    align-items: center;
    margin-left: -10px;
}

.content .operate .func .mediaAddress {
    flex: 1;
    border: none;
    border-radius: 15px;
    padding: 5px 10px;
    margin: 0 20px 0 5px;
    background-color: rgb(239, 243, 244);
    outline: none;
}

.content .operate .func a {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    width: 36px;
    border-radius: 50%;
    cursor: pointer;
}


.content .operate button {
    user-select: none;
    display: inline-block;
    border: none;
    background-color: hsla(160, 100%, 37%, .7);
    font-size: 15px;
    font-weight: bold;
    padding: 0.5rem 1.1rem 0.5rem 1.3rem;
    color: #fff;
    border-radius: 22px;
    letter-spacing: 0.2rem;
    transition: 0.4s;
}

.content .operate .active {
    background-color: hsla(160, 100%, 37%, 1);
    cursor: pointer;
}
</style>