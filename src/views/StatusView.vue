<script setup>
import Title from '../components/Title.vue'
import Status from '../components/Status.vue'
import Loadding from '../components/Loadding.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const status = ref()

onMounted(async () => {
    let resp = await fetch(`https://api.lowlevelnews.com/o/status/${route.params.id}`)
    status.value  = await resp.json()
})

</script>
<template>
    <main>
      <Title title="主题" :backbtn="true" />
      <div class="mainarea">
        <Status v-if="status" :status="status" />
      </div>
      <Loadding v-if="!status" />
    </main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}
.mainarea {
  display: flex;
  padding: 10px 20px;
}
</style>