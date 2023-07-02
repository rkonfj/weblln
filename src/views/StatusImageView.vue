<script setup>
import StatusView from './StatusView.vue'
import BackIcon from '../components/icons/IconBack.vue'
import CloseIcon from '../components/icons/CloseIcon.vue'
import NextIcon from '../components/icons/NextIcon.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router';

const curImage = ref(0)
const images = ref()
const route = useRoute()
const nextSwipe = ref(true)

onMounted(() => {
    curImage.value = route.params.num - 1
    window.sessionStorage.setItem('disable-swipe-nav', 'true')
})

onUnmounted(() => {
    window.sessionStorage.removeItem('disable-swipe-nav')
})

const vSwipe = {
    mounted: (el, binding) => {
        let startX, startY

        el.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX
            startY = event.touches[0].clientY
        }, { passive: true })

        el.addEventListener('touchend', (e) => {
            nextSwipe.value = true
        }, { passive: true })

        el.addEventListener('touchmove', (event) => {
            const deltaX = event.touches[0].clientX - startX
            const deltaY = event.touches[0].clientY - startY

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                binding.value(deltaX)
            }
        }, { passive: true })
    }
}

function showImage(v) {
    if (v > 80 && curImage.value > 0 && nextSwipe.value) {
        curImage.value--
        nextSwipe.value = false
    } else if (v < -80 && curImage.value < images.value.length - 1 && nextSwipe.value) {
        curImage.value++
        nextSwipe.value = false
    }
}

function renderImages(ctx) {
    images.value = ctx.imgs
}
</script>
<template>
    <div class="mainarea">
        <div class="imagepreview" v-swipe="showImage">
            <div v-if="images">
                <div class="count"><span>{{ curImage + 1 }}</span>/<span>{{ images.length }}</span></div>
                <div class="close btn" @click="$router.go(-1)">
                    <CloseIcon />
                </div>
                <div class="prev btn" v-if="curImage != 0" @click="curImage--">
                    <BackIcon />
                </div>
                <div class="next btn" v-if="curImage != images.length - 1" @click="curImage++">
                    <NextIcon />
                </div>
                <img :src="images[curImage].v" alt="Image" />
            </div>
        </div>
        <div class="status">
            <StatusView @imagesReady="renderImages" hideMedia="true" />
        </div>
    </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.mainarea {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    z-index: 1000000;
}

.mainarea .close {
    top: 10px;
    left: 15px;
}

.mainarea .count {
    position: absolute;
    top: 0;
    margin: 0 auto;
    left: 0;
    right: 0;
    width: 100px;
    color: #fff;
    font-size: 15px;
    margin-top: 10px;
    text-align: center;
}

.mainarea .prev {
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
}

.mainarea .next {
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
}

.mainarea .btn {
    position: absolute;
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    transition: 0.4s;
    background-color: rgba(0, 0, 0, 0.1);
}

.mainarea .btn:hover {
    background-color: rgba(0, 0, 0, 0.6);
}

.mainarea .btn svg {
    fill: #fff;
    width: 18px;
    height: 18px;
}

.mainarea .imagepreview {
    position: sticky;
    top: 0;
    display: flex;
    flex: 1;
    background-color: #222;
    z-index: 10000;
    justify-content: center;
    align-items: center;
}

.mainarea .imagepreview img {
    max-height: calc(100vh - 120px);
    max-width: 100%;
    background-color: rgba(255, 255, 255, 0.6);
    min-width: 100px;
    min-height: 100px;
}

.mainarea .status {
    display: flex;
    flex: 0 0 26rem;
    overflow-y: auto;
    transition: 0.4s;
}

@media (max-width: 60rem) {
    .mainarea .status {
        display: none;
    }

    .mainarea .imagepreview img {
        max-height: calc(100vh - 160px);
    }

    .mainarea .close,
    .mainarea .prev {
        left: 10px;
    }

    .mainarea .next {
        right: 10px;
    }
}
</style>