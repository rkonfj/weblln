<script setup>
import { ref } from 'vue';
import SearchIcon from './icons/SearchIcon.vue'
import LabelIcon from './icons/LabelIcon.vue'
import GoogleIcon from './icons/IconGoogle.vue'
import CloseIcon from './icons/CloseIcon.vue'

const searchIconStyle = ref({})
const searchInput = ref()
const searchInputRef = ref()
const holder = ref()
const close = ref()

function showFocusAction() {
    searchIconStyle.value.fill = 'var(--color-main)'
    if (searchInput.value && searchInput.value.length > 0) {
        holder.value.style.display = 'block'
        close.value.style.display = 'flex'
    } else {
        searchIconStyle.value.fill = '#536471'
        holder.value.style.display = 'none'
        close.value.style.display = 'none'
    }
}

function openGoogleSearch() {
    let site = window.location.host
    window.location.href = `https://www.google.com/search?q=site:${site} ${searchInput.value}`
}
</script>
<template>
    <div class="search">
        <SearchIcon :style="searchIconStyle" class="icon" />
        <div class="close" ref="close" @click="searchInput = ''; searchInputRef.focus()">
            <CloseIcon />
        </div>
        <input type="text" ref="searchInputRef" v-model="searchInput" placeholder="Search LLN" @input="showFocusAction"
            @focus="showFocusAction" @blur="showFocusAction" />
        <div class="holder" ref="holder">
            <div class="item" @click="$router.push(`/search/labels/${searchInput}`)">
                <LabelIcon /> {{ searchInput }}
            </div>
            <div class="item" @click="openGoogleSearch">
                <GoogleIcon /> {{ searchInput }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.search {
    display: flex;
    align-items: center;
    position: relative;
    margin-top: 10px;
}

.search input {
    border: none;
    background-color: var(--lln-color-border);
    padding: 12px 0 12px 50px;
    line-height: 18px;
    font-size: 18px;
    border-radius: 30px;
    width: 100%;
    font-weight: normal;
    outline-color: var(--color-main);
}

.search input::placeholder {
    color: #536471;
}

.search .icon {
    width: 18px;
    height: 18px;
    position: absolute;
    fill: #536471;
    left: 20px;
}

.search .close {
    display: none;
    position: absolute;
    right: 15px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    background-color: var(--color-main);
}

.search .close:hover {
    background-color: hsla(160, 100%, 37%, 0.8);
    cursor: pointer;
}

.search .close svg {
    width: 18px;
    height: 18px;
    fill: #fff;
}

.search .holder {
    display: none;
    box-shadow: 0 0 10px var(--lln-color-timeline);
    border-radius: 10px;
    position: absolute;
    bottom: -100px;
    width: 100%;
    z-index: 30;
    background-color: var(--color-background);
    transition: 0.5s;
}

.search .holder .item {
    line-height: 18px;
    padding: 15px 20px;
    display: flex;
    align-items: center;
}

.search .holder .item svg {
    margin-right: 10px;
}

.search .holder .item:hover {
    cursor: pointer;
    background-color: var(--lln-color-bg-hover);
}</style>