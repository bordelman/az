<template>
  <section class="header">
    <MyButton to="/">
      <div class="logo" />
    </MyButton>
    <div class="account">
      <span
        class="log-in"
        v-if="!logged"
        @click="toggleLogged"
        >Přihlásit se</span
      >
      <span
        class="log-out"
        v-else
        @click="toggleLogged"
        >Odhlásit</span
      >
    </div>
  </section>
</template>

<script setup>
const logged = ref(inject('logged'));
function toggleLogged() {
  logged.value = !logged.value;
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  .logo{
    height: 50px;
    width: 50px;
    background-image: url("/IMG_1332.PNG");
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
  }
  .log-in,
  .log-out {
    cursor: pointer;
  }
}
</style>
