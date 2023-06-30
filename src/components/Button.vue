<script setup>
defineProps(['btn'])
</script>
<template>
    <div class="commop" :style="$i18n.locale === 'en' ? 'letter-spacing: normal' : ''">{{ btn }}</div>
</template>

<style scoped>
.commop {
    user-select: none;
    display: inline-block;
    border: none;
    background-color: rgb(15, 20, 25);
    font-size: 15px;
    font-weight: bold;
    padding: 0.4rem 1rem 0.4rem 1.2rem;
    color: #fff;
    border-radius: 20px;
    letter-spacing: 0.2rem;
    transition: 0.4s;
    cursor: pointer;
}

.commop:hover {
  background-color: rgba(15, 20, 25, 0.8);
}
</style>
