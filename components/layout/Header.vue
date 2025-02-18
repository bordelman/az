<template>
  <section class="header">
    <NuxtLink to="/">
      <div class="logo" />
    </NuxtLink>
    <div
      class="center"
      v-if="logged"
    >
      <div class="top">
        <NuxtLink to="/soldiers">Přehled vojáků</NuxtLink>
        <NuxtLink
          v-if="logged.rank.id >= 7"
          to="/soldiers/new"
        >
          Založit vojáka
        </NuxtLink>
        <NuxtLink to="/drills">Přehled cvičení</NuxtLink>
        <NuxtLink
          v-if="logged.rank.id >= 7"
          to="/drills/new"
        >
          Založit cvičení
        </NuxtLink>
      </div>
      <div class="bottom">
        <div class="logged-soldier">
          {{ logged.rank.abbreviation }}. {{ logged.name }}
          {{ logged.lastname }}, {{ logged.position.position }} ({{
            logged.company
          }}/{{ logged.platoon || "_" }}/{{ logged.squad || "_" }})
        </div>
      </div>
    </div>

    <NButton
      class="log-out"
      v-if="logged"
      @click="logOut"
    >
      Odhlásit
    </NButton>
  </section>
</template>

<script setup>
import { NButton } from "naive-ui";
const logged = useState("logged");

function logOut() {
  document.cookie = `army_access_token=;path=/`;
  logged.value = null;
  useRouter().replace("/");
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

  .center {
    display: flex;
    flex-direction: column;
    align-items: center;

    .top {
      display: flex;
      gap: 16px;
    }
  }

  .log-in,
  .log-out {
    cursor: pointer;
  }
}
</style>
