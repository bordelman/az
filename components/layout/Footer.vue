<template>
  <section class="footer">
    <NuxtLink to="/soldiers">Přehled vojáků</NuxtLink>
    <NuxtLink
      v-if="logged.higherPermission"
      to="/soldiers/new"
    >
      Založit vojáka
    </NuxtLink>
    <NuxtLink to="/drills">Přehled cvičení</NuxtLink>
    <NuxtLink
      v-if="logged.higherPermission"
      to="/drills/new"
    >
      Založit cvičení
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
import type { ISoldier } from "~/types";

const logged = useState<ISoldier>("logged");
</script>

<style lang="scss" scoped>
.footer {
  display: flex;
  justify-content: space-around;
  margin: 10px;
}
</style>
