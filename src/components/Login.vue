<script setup>
import GoogleIcon from './icons/IconGoogle.vue'
import GithubIcon from './icons/GithubIcon.vue'

import { RouterLink } from 'vue-router'
import { llnApi, oidcProviders } from '../config'

</script>

<template>
    <div class="sidelogin">
        <h2>{{ $t('nav.hello') }}</h2>
        <div class="tips">{{ $t('nav.welcome') }}</div>
        <div class="btnarea">
            <a v-if="oidcProviders.includes('google')" class="loginbtn"
                :href="`${llnApi}/o/oidc/google?jump=${$route.path}`">
                <GoogleIcon />
                <div class="text">{{ $t('nav.googleauth') }}</div>
            </a>
            <a v-if="oidcProviders.includes('github')" class="loginbtn"
                :href="`${llnApi}/o/oidc/github?jump=${$route.path}`">
                <GithubIcon />
                <div class="text">{{ $t('nav.githubauth') }}</div>
            </a>
        </div>
        <div class="tips links">
            {{ $t('misc.signinagree') }} <RouterLink to="/termsofservice">{{ $t('nav.termsofservice') }}</RouterLink> {{
                $t('misc.and') }}
            <RouterLink to="/privacypolicy">{{ $t('nav.privacypolicy') }}</RouterLink>。
        </div>
    </div>
</template>

<style>
.sidelogin {
    width: 320px;
    border: 1px solid var(--lln-color-border);
    border-radius: 16px;
    padding: 5px 15px;
    margin-top: 20px;
    z-index: 9998;
}

.sidelogin .loginbtn {
    border: 1px solid var(--lln-color-timeline);
    padding: 5px 10px;
    border-radius: 20px;
    width: 100%;
    margin-bottom: 8px;
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
    margin: 20px 0;
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