<template>
  <section class="layout">
    <LayoutHeader />
    <NuxtPage class="content" />
    <LayoutFooter />
  </section>
</template>

<script setup>
const logged = ref(false);
provide("logged", logged);

const ranks = ref();
const positions = ref();
await Promise.all([
  (ranks.value = await getEnum("rank")),
  (positions.value = await getEnum("position")),
]);
useState("ranks", () => ranks);
useState("positions", () => positions);
</script>

<style lang="scss">
* {
  box-sizing: border-box;
}
body {
  margin: 0 auto;
  max-width: 1024px;
  width: 100vw;
}
.layout {
  display: grid;
  min-height: 100vh;
  grid-template-rows: auto 1fr auto;
  margin: auto;
}
</style>
