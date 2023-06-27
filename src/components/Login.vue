<script setup>
import { inject, ref, onMounted } from 'vue';
import GoogleIcon from './icons/IconGoogle.vue'
import { RouterLink } from 'vue-router'
const llnApi = ref("")
onMounted(() => {
    llnApi.value = inject('llnApi')
})
</script>

<template>
    <div class="sidelogin">
        <h2>{{ $t('nav.hello') }}</h2>
        <div class="tips">{{ $t('nav.welcome') }}</div>
        <div class="btnarea">
            <a class="loginbtn" :href="`${llnApi}/o/oidc/google?jump=${$route.path}`">
                <GoogleIcon /><span>{{ $t('nav.googleauth') }}</span>
            </a>
        </div>
        <div class="tips">
            {{ $t('misc.signinagree') }} <RouterLink to="/termsofservice">{{ $t('nav.termsofservice') }}</RouterLink> {{ $t('misc.and') }}
            <RouterLink to="/privacypolicy">{{ $t('nav.privacypolicy') }}</RouterLink>。
        </div>
    </div>
</template>

<style scoped>
.sidelogin {
    width: 320px;
    border: 1px solid rgb(239, 243, 244);
    border-radius: 16px;
    padding: 5px 15px;
    margin-top: 20px;
    z-index: 9998;
}

.sidelogin .loginbtn {
    border: 1px solid rgb(207, 217, 222);
    padding: 5px 10px;
    border-radius: 20px;
    width: 100%;
    display: flex;
    align-items: center;
    font-size: 16px;
    justify-content: center
}

.sidelogin .loginbtn span {
    margin-left: 6px;
    color: #222;
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

h2 {
    padding: 0 3px;
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: bold;
}
</style>