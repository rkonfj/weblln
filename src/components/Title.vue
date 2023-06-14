<template>
    <h2>{{ title }}</h2>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
h2 {
  font-size: 20px;
  font-weight: bold;
  padding: .5rem 1rem;
  display: block;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  position: sticky;
  top: 0;
  backdrop-filter: blur(10px);
  color: #000;
}
</style>