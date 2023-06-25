<script setup>
import StatusView from './StatusView.vue'
import BackIcon from '../components/icons/IconBack.vue'
import CloseIcon from '../components/icons/CloseIcon.vue'
import NextIcon from '../components/icons/NextIcon.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';

const curImage = ref(0)
const images = ref()
const route = useRoute()

onMounted(() => {
    curImage.value = route.params.num - 1
})

function renderImages(ctx) {
    console.log(JSON.stringify(ctx))
    images.value = ctx.imgs
}
</script>
<template>
    <div class="mainarea">
        <div class="imagepreview">
            <div v-if="images">
                <div class="close btn" @click="$router.go(-1)">
                    <CloseIcon />
                </div>
                <div class="prev btn" v-if="curImage != 0" @click="curImage--">
                    <BackIcon />
                </div>
                <div class="next btn" v-if="curImage != images.length - 1" @click="curImage++">
                    <NextIcon />
                </div>
                <transition name="fade">
                    <img :src="images[curImage]" alt="Image" />
                </transition>
            </div>
        </div>
        <div class="status">
            <StatusView @imagesReady="renderImages" />
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
    user-select: none;
    z-index: 1000000;
}

.mainarea .close {
    top: 10px;
    left: 15px;
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
}

.mainarea .status {
    display: flex;
    flex: 0 0 26rem;
    overflow-y: scroll;
    transition: 0.4s;
}

@media (max-width: 60rem) {
    .mainarea .status {
        display: none;
    }

    .mainarea .imagepreview img {
        max-height: calc(100vh - 160px);
    }
    .mainarea .close, .mainarea .prev {
        left: 10px;
    }

    .mainarea .next {
        right: 10px;
    }
}</style>