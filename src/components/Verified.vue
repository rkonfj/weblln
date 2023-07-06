<script setup>
defineProps(['code','title','size'])
import VerifiedIcon from '../components/icons/VerifiedIcon.vue'
function verifiedColor(code) {
    let group = Math.floor((code + 9) / 10)
    if (group == 1) {
        return "#00bd7e"
    }
    if (group == 2) {
        return "rgb(29, 155, 240)"
    }
    return "#800080"
}
</script>
<template>
    <div class="verifiedarea">
        <VerifiedIcon :color="verifiedColor(code)" :size="size?size:16" class="verified" />
    <span class="title" v-if="title" :style="{color: verifiedColor(code)}">{{ title }}</span>
    </div>
</template>

<style scoped>
.verifiedarea {
    display: flex;
    align-items: center;    
}
.verified {
  margin-left: 5px;
  cursor: pointer;
}
.title {
  font-size: 12px;
  margin-left: 2px;
}
</style>