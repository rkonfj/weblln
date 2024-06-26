<script setup>
import { onMounted, ref } from 'vue';
import { renderText, fullMarkdownRender } from '../lln'
import ErrorIcon from './icons/ErrorIcon.vue'
import SuccessIcon from './icons/SuccessIcon.vue'
import LoadingIcon from './icons/LoadingIcon.vue'
import Video from './Video.vue'

import { fileApi, cutQuery53, cutQuery56 } from '../config';

const emit = defineEmits(['imagesReady'])
const props = defineProps(['status', 'simple', 'hideMedia'])
const images = ref([])
const paragraphs = ref([])
const videos = ref([])
const imageErrCount = ref(0)
const imageLoadCount = ref(0)
const hideImages = ref()

const imageBuffer = []

onMounted(() => {
    for (let c of props.status.content) {
        if (c.type == 'img') {
            imageBuffer.push(c)
        } else if (c.type == 'video') {
            videos.value.push({
                url: c.value,
                duration: 0,
                currentTime: 0
            })
        } else {
            paragraphs.value.push(c.value)
        }
    }
    hideImages.value = JSON.parse(window.localStorage.getItem('hideImages')) && !props.hideMedia
    if (!hideImages.value) {
        loadImages()
    }
})

function loadImages() {
    hideImages.value = false
    for (let idx in imageBuffer) {
        handleImageContent(imageBuffer[idx], idx)
    }
}

function handleImageContent(c, idx) {
    let img = new Image()
    img.src = imagePreview(c.value)
    img.onload = () => {
        let shouldPush = true
        // asc order
        for (let i = 0; i < images.value.length; i++) {
            if (idx > images.value[i].i) {
                continue
            }
            images.value.splice(i, 0, { i: idx, v: c.value })
            shouldPush = false
            break
        }
        if (shouldPush) {
            images.value.push({ i: idx, v: c.value })
        }

        emit('imagesReady', {
            imgs: images.value,
            imgCount: imageBuffer.length,
            imgLoadCount: imageLoadCount.value,
            imgErrCount: imageErrCount.value
        })
        imageLoadCount.value++
    }
    img.onerror = () => {
        imageErrCount.value++
    }
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
</script>
<template>
    <div class="raw">
        <div class="sf" v-if="simple" v-for="c in paragraphs">
            <div class="paragraph" v-html="fullMarkdownRender(c)"></div>
        </div>
        <div class="overview" v-if="!simple && paragraphs.length > 0">
            <div v-html="renderText(paragraphs[0])"></div>
            <div v-if="paragraphs.length > 1">...<a class="showMore">{{ $t('status.showmore') }}</a></div>
        </div>
        <div class="sf" v-if="imageErrCount > 0">
            <ErrorIcon class="icon" />
            <span class="error">{{ imageErrCount }} 张图片没有加载成功</span>
        </div>
        <div class="sf" v-if="!hideImages && imageBuffer.length > 0 && imageLoadCount + imageErrCount < imageBuffer.length">
            <LoadingIcon class="icon" />
            <span class="tips">{{ imageBuffer.length - imageLoadCount - imageErrCount }} 张图片正在加载</span>
        </div>
        <div class="sf" v-if="hideImages && imageBuffer.length" @click.stop="loadImages">
            <SuccessIcon class="icon" />
            <span class="tips success">点击加载 {{ imageBuffer.length }} 张图片</span>
        </div>
        <div class="media" v-if="images.length > 0 && !hideMedia">
            <div v-if="images.length == 1" class="image">
                <img @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/1`)"
                    :src="imagePreview(images[0].v)" alt="Image" />
            </div>
            <div v-if="images.length == 2" class="image w50 "><img
                    @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/1`)"
                    :src="imagePreview(images[0].v)" alt="Image" /></div>
            <div v-if="images.length == 2" class="image w50"><img
                    @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/2`)"
                    :src="imagePreview(images[1].v)" alt="Image" /></div>

            <div v-if="images.length == 3" class="image w50 h100"><img
                    @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/1`)"
                    :src="imagePreview(images[0].v, true)" alt="Image" /></div>
            <div v-if="images.length == 3" class="fc">
                <div class="image h50"><img
                        @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/2`)"
                        :src="imagePreview(images[1].v)" alt="Image" /></div>
                <div class="image h50"><img
                        @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/3`)"
                        :src="imagePreview(images[2].v)" alt="Image" /></div>
            </div>
            <div v-if="images.length >= 4" class="fc">
                <div class="image h50"><img
                        @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/1`)"
                        :src="imagePreview(images[0].v)" alt="Image" /></div>
                <div class="image h50"><img
                        @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/2`)"
                        :src="imagePreview(images[1].v)" alt="Image" /></div>
            </div>
            <div v-if="images.length >= 4" class="fc">
                <div class="image h50"><img
                        @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/3`)"
                        :src="imagePreview(images[2].v)" alt="Image" /></div>
                <div class="image h50"><img
                        @click.stop="$router.push(`/${status.user.uniqueName}/status/${status.id}/image/4`)"
                        :src="imagePreview(images[3].v)" alt="Image" /></div>
            </div>
        </div>
        <div class="video" v-if="videos.length > 0">
            <Video :videos="videos" />
        </div>
    </div>
</template>

<style scoped>
.raw {
    display: flex;
    flex-direction: column;
    word-break: break-word;
    color: var(--lln-color-text);
}

.raw .paragraph {
    margin-bottom: 15px;
    word-break: break-all;
    width: 100%;
    color: var(--lln-color-text);
}

.raw .sf {
    display: flex;
    align-items: center;
}

.raw .showMore {
    margin-left: 2px;
    cursor: pointer;
}

.raw .sf .icon {
    width: 18px;
    height: 18px;
}

.raw .sf .error {
    color: red;
    margin-left: 5px;
    font-size: 13px;
}

.raw .sf .tips {
    color: #bbb;
    margin-left: 5px;
    font-size: 13px;
}

.raw .sf .success {
    color: hsla(160, 100%, 37%, 1);
}

.raw .media {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: flex-start;
    margin: 10px 0;
}

.raw .media .fc {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1;
    width: 0;
}

.raw .media .fc:first-child {
    margin-right: 5px;
}

.raw .media .fc .h50:first-child {
    margin-bottom: 5px;
}

.raw .media .image {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 6px;
    box-sizing: content-box;
    min-width: fit-content;
    aspect-ratio: 5/3;
    box-shadow: 0 0 5px var(--lln-color-timeline);
}

.raw .media .w50 {
    width: calc(50% - 2px);
    min-width: unset;
    margin-right: 0;
}

.raw .media .h100 {
    aspect-ratio: 5/6;
    margin-right: 5px;
    height: 100%;
}

.raw .media img {
    object-fit: cover;
    max-width: 100%;
    max-height: 450px;
    min-height: 80px;
}

.video {
    margin: 10px 0;
    position: relative;
    width: 100%;
    max-width: 500px;
}

@media (max-width: 60rem) {
    .raw .sf .icon {
        width: 16px;
        height: 16px;
    }
}
</style>
