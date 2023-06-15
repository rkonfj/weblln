<script setup>
import LogoutIcon from './icons/IconLogout.vue'
defineProps(['session'])
</script>
<template>
    <div class="sessionuser">
        <RouterLink class="profile" :to="'/' + session.uniqueName">
            <img :src="session.picture" alt="avatar" />
            <div class="namearea">
                <div class="n1">{{ session.name }}</div>
                <div class="n2">@{{ session.uniqueName }}</div>
            </div>
        </RouterLink>
        <RouterLink class="logout" to="/logout">
            <LogoutIcon />
        </RouterLink>
    </div>
</template>
<style scoped>
.sessionuser {
  display: flex;
  border-radius: 80px;
  width: 280px;
  cursor: pointer;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  margin-bottom: 20px;
  height: 68px;
}

.sessionuser img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.sessionuser .namearea {
  margin-left: 10px;
}

.sessionuser .profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 68px;
  width: 230px;
  color: #000;
  padding: 10px 15px;
}

.sessionuser .logout {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  padding: 0;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

.sessionuser a .n1 {
  font-weight: bold;
}

.sessionuser a .n2 {
  font-size: 12px;
  color: #666;
}
</style>