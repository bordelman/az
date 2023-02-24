<template>
  <section class="layout">
    <n-modal-provider>
      <LayoutHeader />
      <template v-if="logged">
        <NuxtPage class="content" />
        <LayoutFooter />
      </template>
    </n-modal-provider>
  </section>
</template>

<script setup lang="ts">
import { NModalProvider } from "naive-ui";
import { autoLogIn } from "./utils/api";
import type {ISoldier} from "./types";
onMounted(async () => {
  await autoLogIn();
});

const logged = useState<ISoldier | null>("logged", () => null);
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
