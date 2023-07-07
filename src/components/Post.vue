<script setup>
import Avatar from './Avatar.vue'
import MediaIcon from './icons/IconMedia.vue'
import ParagraphIcon from './icons/ParagraphIcon.vue'
import DefaultAvatarIcon from './icons/DefaultAvatarIcon.vue'
import CloseIcon from './icons/CloseIcon.vue'
import lln from '../lln'
import { ref, onMounted, nextTick, getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'

import { toast } from 'vue3-toastify'

import { llnApi, fileApi, cutQuery53, cutQuery56 } from '../config'

const props = defineProps(['placeholder', 'btntext', 'prevstatus'])
const emit = defineEmits(['posted'])
const { t } = useI18n()
const { proxy } = getCurrentInstance()

const sessionUniqueName = ref("")
const sessionPicture = ref("")
const activeClass = ref("")
const session = ref(null)
const contentRaw = ref("")
const paragraphs = ref([])
const paragraphsContinue = ref([])
const textarea = ref("")
const images = ref([])
const mediaMode = ref()
const loading = ref(false)
const avatar = ref("")
const progressColor = ref("hsla(160, 100%, 37%, 1)")
const progressC = ref(0)
const fileHandler = ref()

const siteRestriction = JSON.parse(window.localStorage.getItem('restriction'))

onMounted(() => {
    let sessionStr = window.localStorage.getItem("session")
    if (sessionStr) {
        let sessionObj = JSON.parse(sessionStr)
        session.value = sessionObj
        sessionUniqueName.value = sessionObj.uniqueName
        sessionPicture.value = sessionObj.picture
    }
    const image = new Image()
    image.src = lln.avatarPreview(sessionPicture.value)
    image.onload = () => {
        avatar.value = image.src
    }
    restoreFromLocal()
})

async function newStatus() {
    if (contentRaw.value.length == 0 && images.value.length == 0 && paragraphs.value.length == 0 || loading.value) {
        return
    }
    loading.value = true
    let content = []
    for (let p of paragraphs.value) {
        content.push({
            type: 'text',
            value: p.trim()
        })
    }
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
    loading.value = false
    if (resp.status == 200) {
        textarea.value.placeholder = props.placeholder
        textarea.value.rows = 2
        contentRaw.value = ''
        paragraphs.value = []
        paragraphsContinue.value = []
        images.value = []
        progressC.value = 0
        resetLocal()
        emit('posted')
        toast(t('tips.success'), { type: 'success' })
    } else if (resp.status == 401) {
        toast('Api Key expired, please log in again', { type: 'error' })
        setTimeout(() => window.location.reload(), 1000)
    } else {
        toast(await resp.text(), { type: 'error' })
    }
}

function updateContentModel() {
    const paddingTop = parseInt(getComputedStyle(textarea.value).getPropertyValue(`padding-top`), 10)
    const paddingBottom = parseInt(getComputedStyle(textarea.value).getPropertyValue(`padding-bottom`), 10)
    const lineHeight = parseInt(getComputedStyle(textarea.value).getPropertyValue(`line-height`), 10)

    contentRaw.value = contentRaw.value.replace(/\n\n+/g, "\n\n")

    textarea.value.rows = 2

    const innerHeight = textarea.value.scrollHeight - paddingTop - paddingBottom
    textarea.value.rows = innerHeight / lineHeight

    updateContentLengthTips()

    saveToLocal()
    if (contentRaw.value.length > 0 || images.value.length > 0 || paragraphs.value.length > 0) {
        activeClass.value = "active"
    } else {
        activeClass.value = ""
    }
}

function updateContentLengthTips() {
    let lengthLimit = 1
    if (siteRestriction) {
        lengthLimit = paragraphs.value.length == 0
            ? siteRestriction.status.overviewLimit : siteRestriction.status.contentLimit
    }

    progressC.value = contentRaw.value.length / lengthLimit * 2 * Math.PI * 10
    if (contentRaw.value.length > lengthLimit) {
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

function addParagraph() {
    paragraphs.value.push(contentRaw.value)
    contentRaw.value = ''
    textarea.value.focus()
    textarea.value.placeholder = t('status.paragraph')
    nextTick(updateContentModel)
}

function editParagraph(i) {
    if (contentRaw.value.length > 0) {
        paragraphsContinue.value.unshift(contentRaw.value)
    }

    if (paragraphs.value.length - 1 > i) {
        for (let p of paragraphs.value.splice(i + 1)) {
            paragraphsContinue.value.unshift(p)
        }
    }

    closeCurrentParagraph()
}

function editParagraphContinue(i) {
    if (contentRaw.value.length > 0) {
        paragraphs.value.push(contentRaw.value)
    }
    if (paragraphsContinue.value.length > 0) {
        for (let p of paragraphsContinue.value.splice(0, i)) {
            paragraphs.value.push(p)
        }
    }
    contentRaw.value = paragraphsContinue.value.shift()
    textarea.value.focus()
    nextTick(updateContentModel)
}

function closeCurrentParagraph() {
    contentRaw.value = paragraphs.value.pop()
    textarea.value.focus()
    if (paragraphs.value.length == 0) {
        textarea.value.placeholder = props.placeholder
    }
    nextTick(updateContentModel)
}

function saveToLocal() {
    let inputKey = `input${window.location.pathname}`
    let paragraphsKey = `paragraphs${window.location.pathname}`
    let paragraphsContinueKey = `paragraphsContinue${window.location.pathname}`
    let imagesKey = `images${window.location.pathname}`

    if (!contentRaw.value || contentRaw.value.length == 0) {
        window.localStorage.removeItem(inputKey)
    } else {
        window.localStorage.setItem(inputKey, contentRaw.value)
    }
    if (paragraphs.value.length == 0) {
        window.localStorage.removeItem(paragraphsKey)
    } else {
        window.localStorage.setItem(paragraphsKey, JSON.stringify(paragraphs.value))
    }
    if (paragraphsContinue.value.length == 0) {
        window.localStorage.removeItem(paragraphsContinueKey)
    } else {
        window.localStorage.setItem(paragraphsContinueKey, JSON.stringify(paragraphsContinue.value))
    }
    if (images.value.length == 0) {
        window.localStorage.removeItem(imagesKey)
    } else {
        window.localStorage.setItem(imagesKey, JSON.stringify(images.value))
    }
}

function restoreFromLocal() {
    let inputKey = `input${window.location.pathname}`
    let paragraphsKey = `paragraphs${window.location.pathname}`
    let paragraphsContinueKey = `paragraphsContinue${window.location.pathname}`
    let imagesKey = `images${window.location.pathname}`
    let cur = window.localStorage.getItem(inputKey)
    if (cur) {
        contentRaw.value = cur
    }

    let p = window.localStorage.getItem(paragraphsKey)
    if (p) {
        paragraphs.value = JSON.parse(p)
    }

    let pc = window.localStorage.getItem(paragraphsContinueKey)
    if (pc) {
        paragraphsContinue.value = JSON.parse(pc)
    }

    let imgs = window.localStorage.getItem(imagesKey)
    if (imgs) {
        images.value = JSON.parse(imgs)
    }
}

function resetLocal() {
    let inputKey = `input${window.location.pathname}`
    let paragraphsKey = `paragraphs${window.location.pathname}`
    let paragraphsContinueKey = `paragraphsContinue${window.location.pathname}`
    let imagesKey = `images${window.location.pathname}`
    window.localStorage.removeItem(inputKey)
    window.localStorage.removeItem(paragraphsKey)
    window.localStorage.removeItem(paragraphsContinueKey)
    window.localStorage.removeItem(imagesKey)
}

async function uploadFile(event) {
    if (event.target.files.length == 0) {
        proxy.$toast('取消上传', { type: 'error' })
        return
    }
    let f = event.target.files[0]
    try {
        proxy.$toast('正在上传')
        let resp = await proxy.$lln.misc.uploadFile(f, session.value)
        images.value.push(`${resp.path}`)
        proxy.$toast(proxy.$t('tips.success'), { type: 'success' })
    } catch (e) {
        if (e.code == 401) {
            proxy.$toast('401', { type: 'error' })
            return
        }
        proxy.$toast(e.message, { type: 'error' })
    }
    fileHandler.value.value = null
}

function imagePreview(src, h) {
    if (src.startsWith('https')) {
        return src
    }
    if (h) {
        return `${fileApi}${src}?${cutQuery56}`
    }
    return `${fileApi}${src}?${cutQuery53}`
}


let pasteImageURLTimer = null
function pasteImageURL(e) {
    e.stopPropagation()
    if (pasteImageURLTimer) {
        return
    }
    pasteImageURLTimer = setTimeout(async () => {
        if (navigator.clipboard) {
            try {
                let text = await navigator.clipboard.readText()
                if (text.startsWith('https')) {
                    images.value.push(text)
                } else {
                    proxy.$toast('不支持的图片格式，正在准备上传')
                }
            } catch (e) {
                proxy.$toast(`${proxy.$t('misc.badop')}: ${e.message}`)
            }
        } else {
            proxy.$toast(proxy.$t('misc.badop'))
        }
        stopPasteImageURL()
    }, 600)
}

function stopPasteImageURL() {
    if (pasteImageURLTimer) {
        clearTimeout(pasteImageURLTimer)
        pasteImageURLTimer = null
    }
}
</script>

<template>
    <div class="postarea">
        <div class="avatararea">
            <a class="avatar" :href="'/' + sessionUniqueName">
                <Avatar v-if="avatar" :src="sessionPicture" />
                <DefaultAvatarIcon class="avatarimg" v-else />
            </a>
        </div>
        <div class="content">
            <p class="paragraph" @click="editParagraph(i)" v-for="(p, i) in paragraphs" :key="i" v-html="lln.renderText(p)">
            </p>
            <div class="editarea">
                <div class="close" @click="closeCurrentParagraph" v-if="paragraphs.length > 0">
                    <CloseIcon />
                </div>
                <textarea class="raw" ref="textarea" rows="2" v-model="contentRaw" @dragover.prevent @drop="handleDragEnter"
                    @paste="paseText" @input="updateContentModel" :placeholder="placeholder">
                </textarea>
            </div>
            <p class="paragraph" @click="editParagraphContinue(i)" v-for="(p, i) in paragraphsContinue" :key="i"
                v-html="lln.renderText(p)">
            </p>
            <div class="media" v-if="images.length > 0">
                <div v-if="images.length == 1" class="image">
                    <div class="close" @click="removeMedia(0)">
                        <CloseIcon />
                    </div><img :src="imagePreview(images[0])" alt="Image" />
                </div>
                <div v-if="images.length == 2" class="image w50">
                    <div class="close" @click="removeMedia(0)">
                        <CloseIcon />
                    </div><img :src="imagePreview(images[0])" alt="Image" />
                </div>
                <div v-if="images.length == 2" class="image w50">
                    <div class="close" @click="removeMedia(1)">
                        <CloseIcon />
                    </div><img :src="imagePreview(images[1])" alt="Image" />
                </div>

                <div v-if="images.length == 3" class="image w50 h100">
                    <div class="close" @click="removeMedia(0)">
                        <CloseIcon />
                    </div><img :src="imagePreview(images[0], true)" alt="Image" />
                </div>
                <div v-if="images.length == 3" class="fc">
                    <div class="image h50">
                        <div class="close" @click="removeMedia(1)">
                            <CloseIcon />
                        </div><img :src="imagePreview(images[1])" alt="Image" />
                    </div>
                    <div class="image h50">
                        <div class="close" @click="removeMedia(2)">
                            <CloseIcon />
                        </div><img :src="imagePreview(images[2])" alt="Image" />
                    </div>
                </div>
                <div v-if="images.length >= 4" class="fc">
                    <div class="image h50">
                        <div class="close" @click="removeMedia(0)">
                            <CloseIcon />
                        </div><img :src="imagePreview(images[0])" alt="Image" />
                    </div>
                    <div class="image h50">
                        <div class="close" @click="removeMedia(1)">
                            <CloseIcon />
                        </div><img :src="imagePreview(images[1])" alt="Image" />
                    </div>
                </div>
                <div v-if="images.length >= 4" class="fc">
                    <div class="image h50">
                        <div class="close" @click="removeMedia(2)">
                            <CloseIcon />
                        </div><img :src="imagePreview(images[2])" alt="Image" />
                    </div>
                    <div class="image h50">
                        <div class="close" @click="removeMedia(3)">
                            <CloseIcon />
                        </div><img :src="imagePreview(images[3])" alt="Image" />
                    </div>
                </div>
            </div>
            <div class="operate">
                <div class="func">
                    <input type="file" accept="image/*" style="display: none;" @change="uploadFile" ref="fileHandler" />
                    <a title="媒体" @click="fileHandler.click()" @touchstart="pasteImageURL" @mousedown="pasteImageURL"
                        @touchend="stopPasteImageURL" @mouseup="stopPasteImageURL">
                        <MediaIcon />
                    </a>
                    <input class="mediaAddress" type="text" v-if="mediaMode" :placeholder="$t('status.mediaaddr')"
                        @blur="addMedia" />
                </div>
                <div class="postbtn">
                    <svg class="progress" width="24" height="24" viewBox="0 0 24 24"
                        v-if="contentRaw && contentRaw.length > 0">
                        <circle class="progress-background" cx="12" cy="12" r="10" stroke="var(--lln-color-border)"
                            stroke-width="3" fill="none" />
                        <circle class="progress-fill" cx="12" cy="12" r="10" fill="none" :stroke="progressColor"
                            stroke-width="3" :stroke-dasharray="`${progressC},62.83`" />
                    </svg>
                    <div class="line" v-if="contentRaw && contentRaw.length > 0"></div>
                    <div class="newp" title="新段落" @click="addParagraph" v-if="contentRaw && contentRaw.length > 0">
                        <ParagraphIcon />
                    </div>
                    <button :class="activeClass" :style="$i18n.locale === 'en' ? 'letter-spacing: normal' : ''"
                        @click="newStatus()">{{ loading ? "···" : btntext }}</button>
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
    border: .5px solid var(--lln-color-border);
    box-shadow: 0 0 2px var(--lln-color-border);
}

.postarea {
    display: flex;
    padding: 10px 15px;
    border-bottom: .5px solid var(--lln-color-border);
}

.avatararea {
    flex: 0 0 3.1rem;
}

.content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.content .paragraph {
    margin-bottom: 10px;
    word-break: break-word;
}

.content .editarea {
    position: relative;
}

.content .editarea .close {
    position: absolute;
    top: 0;
    right: -10px;
    width: 22px;
    height: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
}

.content .editarea .close:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
    cursor: pointer;
    transition: 0.4s;
}

.content .editarea .close svg {
    width: 16px;
    height: 16px;
    fill: hsla(160, 100%, 37%, 1);
}

.content .media {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    margin: 10px 0;
    user-select: none;
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
}

.content .media .fc:first-child {
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
    border-radius: 12px;
    box-sizing: content-box;
    min-width: fit-content;
    aspect-ratio: 5/3;
    box-shadow: 0 0 5px var(--lln-color-timeline);
    position: relative;
}

.content .media .w50 {
    width: calc(50% - 2px);
    min-width: unset;
    margin-right: 0;
}

.content .media .h100 {
    aspect-ratio: 5/6;
    margin-right: 5px;
    height: calc(100% - 2px);
}

.content .media img {
    object-fit: cover;
    max-width: 100%;
    max-height: 400px;
    min-height: 80px;
}

.content .raw {
    width: 100%;
    min-height: 3.5rem;
    padding: 0.3rem 0 .2rem 0;
    outline: none;
    border: none;
    max-width: 100%;
    font-size: 18px;
    word-break: break-all;
    font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
        Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    background-color: var(--color-background);
    color: var(--lln-color-text);
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
    height: 36px;
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
    margin: 0 15px 0 5px;
    background-color: var(--lln-color-border);
    outline: none;
    width: 0;
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

.content .operate .func a svg {
    width: 18px;
    height: 18px;
}

.content .operate .postbtn .newp {
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
    display: flex;
    cursor: pointer;
    margin: 10px;
    border: 1px solid var(--lln-color-timeline);
    border-radius: 50%;
}

.content .operate .postbtn .newp:hover {
    background-color: var(--lln-color-border);
    transition: 0.4s;
}

.content .operate .postbtn .line {
    height: 32px;
    width: 1px;
    background-color: var(--lln-color-timeline);
}

.content .operate .postbtn .newp svg {
    width: 18px;
    height: 18px;
    fill: hsla(160, 100%, 37%, 1);
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

@media (max-width: 60rem) {
    .content .raw {
        font-size: 16px;
    }

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

    .content .operate .func .mediaAddress {
        margin: 0 10px 0 0;
    }
}
</style>