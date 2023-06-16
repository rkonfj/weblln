<script setup>
import Title from '../components/Title.vue'
import NoMsgIcon from '../components/icons/IconNoMsg.vue'
</script>
<template>
    <main>
      <Title title="消息" />
      <div class="empty">
      <NoMsgIcon />
      </div>
</main>
</template>

<style scoped>
main {
  border-left: 1px solid rgb(239, 243, 244);
  border-right: 1px solid rgb(239, 243, 244);
}
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20rem;
}
</style>