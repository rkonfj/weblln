<script setup>
import PlayIcon from './icons/PlayIcon.vue'
import PauseIcon from './icons/PauseIcon.vue'
import FullscreenIcon from './icons/FullscreenIcon.vue'
import Loading from './Loading.vue'

const props = defineProps(['videos'])

function playVideo(e) {
    const play = e.target.parentElement.querySelector('.play')
    const ctrl = e.target.parentElement.querySelector('.ctrl')
    if (e.target.paused || e.target.ended) {
        if (!ctrl.style.display || ctrl.style.display == 'none') {
            e.target.play()
            play.style.display = 'none'
            return
        }
        ctrl.style.display = 'none'
        return
    }
    if (!ctrl.style.display || ctrl.style.display == 'none') {
        ctrl.style.display = 'flex'
        return
    }
    ctrl.style.display = 'none'
}

function onPlay(e) {
    const play = e.target.parentElement.querySelector('.play')
    play.style.display = 'none'
    const loading = e.target.parentElement.querySelector('.loading')
    loading.style.display = 'flex'
}

function onPause(e) {
    const play = e.target.parentElement.querySelector('.play')
    play.style.display = 'flex'
}

function onPlaying(e) {
    const loading = e.target.parentElement.querySelector('.loading')
    if (e.target.readyState < 4) {
        loading.style.display = 'flex'
    } else {
        loading.style.display = 'none'
    }
    e.target.parentElement.querySelector('.progress .duration').innerHTML = Math.floor(e.target.duration)
    e.target.parentElement.querySelector('.progress .currentTime').innerHTML = Math.floor(e.target.currentTime)
}
function pauseVideo(e) {
    const container = getVideoContainer(e.target)
    container.querySelector('video').pause()
    const play = container.querySelector('.play')
    const ctrl = container.querySelector('.ctrl')
    play.style.display = 'flex'
    ctrl.style.display = 'none'
}

function getVideoContainer(target) {
    let container = target.parentElement
    while (true) {
        if (container.querySelector('video')) {
            break
        }
        container = container.parentElement
    }
    return container
}

function playLeft(e) {
    const container = getVideoContainer(e.target)
    const v = container.querySelector('video')
    v.currentTime -= 15
    const loading = container.querySelector('.loading')
    loading.style.display = 'flex'
}

function playRight(e) {
    const container = getVideoContainer(e.target)
    const v = container.querySelector('video')
    v.currentTime += 15
    const loading = container.querySelector('.loading')
    loading.style.display = 'flex'
}

function showCtrl(e) {
    const v = e.target.querySelector('video')
    if (v.paused || v.ended) {
        return
    }
    const ctrl = e.target.querySelector('.ctrl')
    ctrl.style.display = 'flex'
}

function hideCtrl(e) {
    const v = e.target.querySelector('video')
    if (v.paused || v.ended) {
        return
    }
    const ctrl = e.target.querySelector('.ctrl')
    ctrl.style.display = 'none'
}

function fullscreen(e) {
    const container = getVideoContainer(e.target)
    container.querySelector('video').requestFullscreen()
}
</script>
<template>
    <div v-for="v of videos" @click.stop="playVideo" @mouseenter="showCtrl" @mouseleave="hideCtrl">
        <div class="play">
            <div class="btn">
                <PlayIcon />
            </div>
        </div>
        <div class="ctrl">
            <div class="btn" @click.stop="playLeft">-15s</div>
            <div class="btn pause" @click.stop="pauseVideo">
                <PauseIcon />
            </div>
            <div class="btn" @click.stop="playRight">+15s</div>
            <div class="op">
                <div class="progress">
                    <span class="currentTime">0</span> / <span class="duration">0</span>
                </div>
            </div>
            <div class="fullscreen" @click.stop="fullscreen">
                <FullscreenIcon />
            </div>
        </div>
        <div class="loading">
            <Loading />
        </div>
        <video @play="onPlay" @pause="onPause" @timeupdate="onPlaying" @ended="playVideo">
            <source :src="v.url">
            Your browser does not support the video tag.
        </video>
    </div>
</template>
<style scoped>
.video .ctrl,
.video .loading,
.video .play,
.video video {
    aspect-ratio: 5/3;
    width: 100%;
    max-width: 500px;
    border-radius: 6px;
    background-color: var(--lln-color-play-bg);
}

.video .loading {
    position: absolute;
    background: none;
    justify-content: center;
    align-items: center;
    display: none;
    z-index: 11;
}

.video .play {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    background-color: var(--lln-color-play-mark);
}

.video .play .duration {
    position: absolute;
    right: 10px;
    bottom: 10px;
}

.video .play .btn {
    width: 46px;
    height: 46px;
    background-color: var(--color-main);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    cursor: pointer;
}

.video .play .btn svg {
    width: 22px;
    height: 22px;
    fill: #fff;
    margin-right: -2px;
}

.video .ctrl {
    position: absolute;
    background: none;
    box-sizing: content-box;
    display: none;
    align-items: center;
    justify-content: space-around;
    z-index: 10;
    transition: 0.5s;
}

.video .ctrl .op {
    position: absolute;
    bottom: 10px;
    background: none;
    display: flex;
    justify-content: center;
}

.video .ctrl .op .progress {
    background-color: rgba(0, 0, 0, 0.8);
    padding: 5px 10px;
    border-radius: 6px;
    color: #fff;
    user-select: none;
    font-size: 12px;
    line-height: 12px;
}

.video .ctrl .fullscreen {
    position: absolute;
    bottom: 11px;
    right: 10px;
    height: 18px;
    cursor: pointer;
}

.video .ctrl .fullscreen svg {
    width: 18px;
    height: 18px;
    fill: rgba(0, 0, 0, 0.8);
}

.video .ctrl .btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.8);
    user-select: none;
    cursor: pointer;
}

.video .ctrl .pause {
    width: 46px;
    height: 46px;
}

.video .ctrl .btn svg {
    width: 12px;
    height: 12px;
    fill: #fff;
}

@media (max-width: 60rem) {
    .video .play .btn {
        width: 30px;
        height: 30px;
    }

    .video .play .btn svg {
        width: 18px;
        height: 18px;
    }

    .video .ctrl .btn {
        width: 30px;
        height: 30px;
        font-size: 10px;
    }

    .video .ctrl .btn svg {
        width: 10px;
        height: 10px;
    }

    .video .ctrl .pause {
        width: 36px;
        height: 36px;
    }

    .video .ctrl .op .progress {
        font-size: 10px;
        line-height: 10px;
    }
}
</style>