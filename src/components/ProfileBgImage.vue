<script setup>
import { fileApi, cutQuery31 } from '../config';

defineProps(['src'])


function bgPreview(src) {
    if (src.startsWith('https')) {
        return src
    }
    return `${fileApi}${src}?${cutQuery31}`
}
</script>
<template>
    <img v-if="src" :src="bgPreview(src)" alt="Image" />
</template>