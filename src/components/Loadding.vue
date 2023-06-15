<template>
    <div class="loadingarea">
        <div class="loading"></div>
    </div>
</template>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loadingarea {
    display: flex;
    width: 100%;
    padding: 30px 0;
    justify-content: center;
}
.loading {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid hsla(160, 100%, 37%, 1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
</style>
