<script setup>
import Title from '../components/Title.vue'
import Loadding from '../components/Loadding.vue'
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
let message = ref("")

onMounted(async () => {
    let resp = await fetch(`${inject('llnApi')}/o/authorize/${route.params.provider}?state=${route.query.state}&code=${route.query.code}`, {
        method: "post",
    })
    let sessionObj = await resp.json()
    if (sessionObj.apiKey) {
        window.localStorage.setItem('session', JSON.stringify(sessionObj))
        resp.headers.forEach((value, name) => {
            console.log(`${name}: ${value}`)
        })
        window.location.href = resp.headers.get("X-Jump")
    } else {
        message.value = sessionObj
    }
})
</script>
<template>
    <main>
        <Title :title="$t('nav.authorize')" />
        <div v-if="message" class="tips">{{ message }}</div>
        <Loadding v-if="!message" />
    </main>
</template>
<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}

main ul li {
  display: flex;
  padding: 10px 20px;
  transition: .5s;
  border-bottom: 1px solid rgb(239, 243, 244);
}
main ul li:hover {
  background-color: rgba(0,0,0,0.03);
  cursor: pointer;
}
.tips {
    padding: 2rem;
    font-size: 18px;
    color: #666;
}
</style>
