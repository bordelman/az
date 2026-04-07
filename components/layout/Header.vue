<template>
  <section class="header">
    <NuxtLink to="/">
      <div class="logo" />
    </NuxtLink>
    <div class="center" v-if="logged">
      <div class="top">
        <NuxtLink v-if="logged.personalNumber !== 1" to="/">Můj profil</NuxtLink>
        <NuxtLink to="/soldiers">Přehled vojáků</NuxtLink>
        <NuxtLink v-if="logged.higherPermission" to="/soldiers/new">
          Založit vojáka
        </NuxtLink>
        <NuxtLink to="/drills">Přehled cvičení</NuxtLink>
        <NuxtLink v-if="logged.higherPermission" to="/drills/new">
          Založit cvičení
        </NuxtLink>
        <NuxtLink v-if="logged.higherPermission" to="/administration">
          Administrace
        </NuxtLink>
      </div>
      <div class="bottom">
        <div v-if="logged.personalNumber !== 1" class="logged-soldier">
          {{ logged.rank.abbreviation }}. {{ logged.firstname }}
          {{ logged.lastname }}, {{ logged.assignment?.position.position }} ({{
            logged.assignment?.company
          }}/{{ logged.assignment?.platoon || "_" }}/{{ logged.assignment?.squad || "_" }})
        </div>
        <div v-else>
          Admin
        </div>
      </div>
    </div>

    <NButton class="log-out" v-if="logged" @click="logOut">
      Odhlásit
    </NButton>
  </section>
</template>

<script setup lang="ts">
import { NButton } from "naive-ui";
import type { ISoldier } from "~/types";

const logged = useState<ISoldier | null>("logged");

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
    background-image: url("/logo.png");
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
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
      column-gap: 16px;
      row-gap: 8px;
    }
  }

  .log-in,
  .log-out {
    cursor: pointer;
  }
}
</style>
