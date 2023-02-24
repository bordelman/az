<template>
  <section class="header">
    <NuxtLink to="/">
      <div class="logo" />
    </NuxtLink>
    <div v-if="logged" class="logged-soldier">
      {{ logged.rank.abbreviation }}. {{ logged.name }} {{ logged.lastname }}, {{ logged.position.position }} ({{
        logged.company }}/{{ logged.platoon || "" }}/{{ logged.squad || "" }})
    </div>
    <div class="account">
      <n-button class="log-in" v-if="!logged" @click="showModal = true">
        Přihlásit se
      </n-button>
      <n-button class="log-out" v-else @click="logOut">Odhlásit</n-button>
    </div>
    <n-modal v-model:show="showModal" class="custom-card" preset="card" :style="bodyStyle" title="Přihlášení"
      :bordered="false" size="huge">
      <form class="login-form">
        <div class="row">
          <n-input v-model:value="login" placeholder="Login (e-mail nebo osobní číslo)" />
        </div>
        <div class="row">
          <n-input v-model:value="password" type="password" show-password-on="mousedown" placeholder="Heslo" />
        </div>
      </form>
      <template #footer>
        <n-button :disabled="!password || !login" @click="logIn(login, password)">
          Přihlásit
        </n-button>
      </template>
    </n-modal>
  </section>
</template>

<script setup>
import {NButton, NInput, NModal} from "naive-ui";
import {logIn} from "../../utils/api";
const logged = useState("logged"),
  bodyStyle = {
    width: "600px",
  },
  login = ref(),
  password = ref(),
  showModal = ref(false);

watch(logged, () => {
  if (logged) {
    showModal.value = false;
  }
});

function logOut() {
  document.cookie =
    "army_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  logged.value = null;
}
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;

  .logo {
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
