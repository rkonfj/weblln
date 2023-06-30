<template>
    <div class="loadingarea">
        <div class="loading"></div>
    </div>
</template>

<style scoped>
.loadingarea {
    display: flex;
    width: 100%;
    padding: 20px 0;
    justify-content: center;
}
.loading {
  width: 30px;
  height: 30px;
  border: 4px solid var(--lln-color-border);
  border-top: 4px solid hsla(160, 100%, 37%, 1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
