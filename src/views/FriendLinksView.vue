<script setup>
import Title from '../components/Title.vue'
import Loading from '../components/Loading.vue'
import { onMounted, ref } from 'vue';
import { loadSettings } from '../lln';

const settings = ref()

onMounted(async () => {
    settings.value = await loadSettings()
})

</script>
<template>
    <main>
        <Title :title="$t('nav.friends')" />
        <Loading v-if="!settings" />
        <ul v-if="settings">
            <li v-for="item in settings.friends">
                <div class="logo">
                    <img :src="item.logo" alt="Logo" />
                </div>
                <div class="content">
                    <div class="title">{{ item.title }}<a :href="item.url">{{ item.url }}</a></div>
                    <div class="desc">{{ item.desc }}</div>
                </div>
            </li>
        </ul>
    </main>
</template>
<style scoped>
main ul li {
    display: flex;
    padding: 10px 15px;
    transition: .5s;
    border-bottom: 1px solid var(--lln-color-border);
}

main ul li:hover {
    background-color: var(--lln-color-bg-hover);
    cursor: pointer;
}

main ul li .logo {
    border: .5px solid var(--lln-color-border);
    box-shadow: 0 0 2px var(--lln-color-border);
    margin-right: 10px;
    box-sizing: content-box;
}

main ul li .logo img,
main ul li .logo {
    width: 55px;
    height: 55px;
    min-width: 55px;
    min-height: 55px;
    border-radius: 50%;
}



main ul li .logo img {
    object-fit: scale-down;
}

main ul li .content {
    width: 100%;
    display: flex;
    flex-direction: column;
}

main ul li .content .title {
    font-size: 18px;
    color: var(--lln-color-text);
}


main ul li .content .desc {
    font-size: 15px;
    color: var(--lln-color-text);
}

main ul li .content a {
    margin-left: 10px;
    font-size: 16px;
}
</style>