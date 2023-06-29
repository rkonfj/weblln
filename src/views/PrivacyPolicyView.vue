<script setup>
import Title from '../components/Title.vue'
</script>
<template>
    <main>
      <Title :title="$t('nav.privacypolicy')" />
      <ul>
        <li>1. 本站使用 OIDC 认证帐号。Provider 提供用户名、邮箱和头像，其中只有邮箱是保密的</li>
        <li>2. 本站发表的任何文本、表情和媒体等都是公开的</li>
        <li>3. 你的网络 IP 或代理 IP 会被记录，但不会被公开</li>
        <li>4. 你的浏览器标识等信息会被记录，其中的操作系统信息可能会被公开</li>
        <li>5. 我们的服务器固若金汤，最大程度确保你保密的信息不被窃取</li>
      </ul>
    </main>
</template>

<style scoped>
main {
  border-left: 1px solid var(--lln-color-border);
  border-right: 1px solid var(--lln-color-border);
}

main ul li {
  padding: 2px 15px;
}
</style>