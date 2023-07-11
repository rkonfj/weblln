<script setup>
import GoogleIcon from './icons/IconGoogle.vue'
import GithubIcon from './icons/GithubIcon.vue'
import MicrosoftIcon from './icons/MicrosoftIcon.vue'
import GitlabIcon from './icons/GitlabIcon.vue'
import Loading from './Loading.vue'

import { RouterLink } from 'vue-router'
import { llnApi } from '../config'
import { onMounted, ref } from 'vue';
import { loadSettings } from '../lln'

const settings = ref()

onMounted(async () => {
    settings.value = await loadSettings()
})

</script>

<template>
    <div class="sidelogin">
        <h2>{{ $t('nav.hello') }}</h2>
        <div class="tips">{{ $t('nav.welcome') }}</div>
        <Loading v-if="!settings" />
        <div v-if="settings" class="btnarea">
            <a class="loginbtn" v-for="provider of settings.oidcProviders"
                :href="`${llnApi}/o/oidc/${provider}?jump=${$route.path}`">
                <GoogleIcon v-if="provider == 'google'" />
                <GithubIcon v-if="provider == 'github'" />
                <MicrosoftIcon v-if="provider == 'microsoft'" />
                <GitlabIcon v-if="provider == 'gitlab'" />
                <div class="text">{{ $t(`nav.${provider}auth`) }}</div>
            </a>
        </div>
        <div v-if="settings" class="tips links">
            {{ $t('misc.signinagree') }} <RouterLink :to="settings.termsOfService">{{ $t('nav.termsofservice') }}
            </RouterLink> {{
                $t('misc.and') }}
            <RouterLink :to="settings.privacyPolicy">{{ $t('nav.privacypolicy') }}</RouterLink>。
        </div>
    </div>
</template>

<style>
.sidelogin {
    width: 320px;
    border: 1px solid var(--lln-color-border);
    border-radius: 16px;
    padding: 5px 15px;
    margin-top: 10px;
    z-index: 12;
}

.sidelogin .loginbtn {
    border: 1px solid var(--lln-color-timeline);
    padding: 5px 10px;
    border-radius: 20px;
    width: 100%;
    margin-bottom: 7px;
    display: flex;
    align-items: center;
    font-size: 16px;
    justify-content: center;
}

.sidelogin .loginbtn svg {
    width: 18px;
    height: 18px;
}

.sidelogin .loginbtn .text {
    margin-left: 6px;
    color: var(--lln-color-text);
    font-weight: bolder;
}

.sidelogin .btnarea {
    margin: 18px -15px;
    padding: 0 15px;
    max-height: 134px;
    overflow-y: auto;
}

.sidelogin .btnarea::-webkit-scrollbar {
    width: 8px;
    transition: 0.4s;
}

.sidelogin .btnarea::-webkit-scrollbar-thumb {
    background-color: var(--lln-color-timeline);
    border-radius: 3px;
}

.sidelogin .tips {
    margin: 10px 0;
    font-size: 13px;
    color: #666;
    line-height: 16px;
}
</style>

<style scoped>
h2 {
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: bold;
    color: var(--lln-color-text);
}
</style>