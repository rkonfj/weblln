<script setup>
import { fileApi, cutQuery11 } from '../config';
defineProps(['src'])

function avatarPreview(src) {
    if (src.startsWith('https')) {
        return src
    }
    return `${fileApi}${src}?${cutQuery11}`
}
</script>
<template>
    <img :src="avatarPreview(src)" alt="Avatar Image" />
</template>