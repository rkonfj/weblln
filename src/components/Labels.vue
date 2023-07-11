<script setup>
import Loading from '../components/Loading.vue'
import { ref, onMounted, getCurrentInstance } from 'vue'

const emit = defineEmits(['sessionExpired'])
const { proxy } = getCurrentInstance()
const labels = ref()
const session = ref()

onMounted(async () => {
    let sessionStr = window.localStorage.getItem("session")
    if (sessionStr) {
        session.value = JSON.parse(sessionStr)
    }
    try {
        let resp = await proxy.$lln.status.labels(12, session.value)
        if (resp.headers.get("X-Session-Valid") == "false") {
            emit("sessionExpired")
        }
        labels.value = resp.v
        if (labels.value == null) {
            labels.value = []
        }
    } catch (e) {
        proxy.$toast(e.message, { type: 'error' })
    }

})
</script>
<template>
    <div v-if="!labels || labels.length > 0" class="sidelabels">
        <div v-if="labels && labels.length > 0">
            <h2>{{ $t('nav.hot') }}</h2>
            <ul>
                <li v-for="label in labels" @click="$router.push(`/search/labels/${label.value}`)"
                    :class="$route.params.label === label.value ? 'active' : ''">
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
    border: 1px solid var(--lln-color-border);
    border-radius: 16px;
    padding: 0 0 12px 0;
    background-color: var(--lln-color-side-bg);
    margin-top: 15px;
}

.sidelabels ul {
    overflow-y: auto;
    max-height: calc(100vh - 430px);
}

.sidelabels li {
    padding: 9px 15px;
    display: flex;
    justify-content: space-between;
}

.sidelabels .active,
.sidelabels li:hover {
    background-color: var(--lln-color-bg-hover);
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

.sidelabels ul::-webkit-scrollbar {
    width: 8px;
    transition: 0.4s;
}

.sidelabels ul::-webkit-scrollbar-thumb {
    background-color: rgb(83, 100, 113, 0.3);
    border-radius: 3px;
}

h2 {
    padding: 6px 15px;
    font-size: 20px;
    font-weight: bold;
    color: #000;
    color: var(--lln-color-text);
    margin-bottom: 2px;
}

@media (prefers-color-scheme: dark) {
    .sidelabels {
        border: none;
    }
}
</style>