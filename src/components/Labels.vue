<script setup>
import Loading from '../components/Loading.vue'
import { ref, onMounted, inject } from 'vue'

const emit = defineEmits(['sessionExpired'])
const labels = ref()
const session = ref()

onMounted(async () => {
    let sessionStr = window.localStorage.getItem("session")
    if (sessionStr) {
        session.value = JSON.parse(sessionStr)
    }
    let opts = {}
    if (session.value) {
        opts.headers = {
            "Authorization": session.value.apiKey,
        }
    }
    let resp = await fetch(`${inject('llnApi')}/o/labels`, opts)
    if (resp.headers.get("X-Session-Valid") == "false") {
        emit("sessionExpired")
    }
    labels.value = await resp.json()
    if (labels.value == null) {
        labels.value = []
    }
})
</script>
<template>
    <div v-if="!labels || labels.length > 0" class="sidelabels">
        <div v-if="labels && labels.length > 0">
            <h2>{{ $t('nav.hot') }}</h2>
            <ul>
                <li v-for="label in labels" @click="$router.push(`/search/labels/${label.value}`)" :class="$route.params.label === label.value ? 'active' : ''">
                    <div class="label">#{{ label.value }}</div>
                    <div class="count">{{ label.count }}</div>
                </li>
            </ul>
        </div>
        <Loading v-if="!labels" />
    </div>
</template>
<style scoped>
.sidelabels {
    width: 320px;
    border: 1px solid rgb(239, 243, 244);
    border-radius: 16px;
    padding: 0 0 16px 0;
    background-color: rgb(247, 249, 249);
    margin-top: 20px;
}

.sidelabels li {
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
}

.sidelabels .active,
.sidelabels li:hover {
    background-color: rgba(0, 0, 0, 0.04);
    cursor: pointer;
    transition: 0.4s;
}

.sidelabels .label {
    font-weight: bold;
    font-size: 15px;
}

.sidelabels .count {
    font-size: 14px;
    color: #666;
}

h2 {
    padding: 6px 15px;
    font-size: 20px;
    font-weight: bold;
    color: #000;
}
</style>