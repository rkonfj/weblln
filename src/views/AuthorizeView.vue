<script setup>
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { proxy } = getCurrentInstance()
const message = ref("")

onMounted(async () => {
    let provider = route.params.provider
    let code = route.query.code
    if (!provider || !code) {
        message.value = 'An error occurred'
        return
    }
    try {
        let resp = await proxy.$lln.user.authorize(provider, route.query.state, code)
        let sessionObj = resp.v
        window.localStorage.setItem('session', JSON.stringify(sessionObj))
        if (!window.localStorage.getItem('lang') && sessionObj.locale) {
            window.localStorage.setItem('lang', sessionObj.locale.split('-')[0])
        }
        window.location.href = resp.headers.get("X-Jump")
        return
    } catch (e) {
        message.value = e.message
    }
})
</script>
<template>
    <main>
        <Title :title="$t('nav.authorize')" />
        <div v-if="message" class="tips">{{ message }}</div>
        <Loading v-if="!message" />
    </main>
</template>
<style scoped>
main {
    border-left: 1px solid var(--lln-color-border);
    border-right: 1px solid var(--lln-color-border);
}

main ul li {
    display: flex;
    padding: 10px 20px;
    transition: .5s;
    border-bottom: 1px solid var(--lln-color-border);
}

main ul li:hover {
    background-color: var(--lln-color-bg-hover);
    cursor: pointer;
}

.tips {
    padding: 2rem;
    font-size: 18px;
    color: #666;
}
</style>
