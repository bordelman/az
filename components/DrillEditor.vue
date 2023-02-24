<template>
  <section class="drill-new">
    <div class="form">
      <div class="input-row">
        <label for="name">Název cvičení</label>
        <input id="name" type="text" v-model="drill.name" />
      </div>
      <div class="input-row">
        <label for="dateFrom">Od</label>
        <input
          id="dateFrom"
          type="date"
          v-model="drill.dateFrom"
        />
      </div>
      <div class="input-row">
        <label for="dateTo">Do</label>
        <input
          id="dateTo"
          type="date"
          v-model="drill.dateTo"
        />
      </div>
      <div class="input-row">
        <label for="returnDate">Datum návratu</label>
        <input
          id="returnDate"
          type="date"
          v-model="drill.returnDate"
        />
      </div>
      <div class="input-row">
        <label for="additionlaInfo">Dodatečné info</label>
        <input id="additionlaInfo" type="text" v-model="drill.additionalInfo" />
      </div>
    </div>
    <NButton @click="showSoldierSelector = true"> Přidat vojáky </NButton>
    <NButton @click="callCreateDrill">Uloži</NButton>
    <n-modal
      v-model:show="showSoldierSelector"
      class="custom-card"
      preset="card"
      :style="{ maxWidth: '80vw' }"
      title="Nominace"
      :bordered="false"
      size="huge"
    >
      <div class="group">
        <div class="group-heading">Nenominovaní</div>
        <Soldiers :exclude="nominated" :click-action="nominateSoldier" />
      </div>
      <div class="group">
        <div class="group-heading">Nominovaní</div>
        <Soldiers :include="nominated" :click-action="denominateSoldier" />
      </div>
    </n-modal>
  </section>
</template>

<script setup lang="ts">
import { NButton, NModal } from "naive-ui";
import type { PropType } from "vue";
import type { IDrill } from "~/types";

const { drill, nominated } = defineProps({
    drill: {
      type: Object as PropType<IDrill>,
      default: {
        name: null,
        dateFrom: null,
        dateTo: null,
        returnDate: null,
        additionalInfo: null,
      },
    },
    nominated: {
      type: Array<number>,
      default: [],
    },
  }),
  showSoldierSelector = ref(false);

function nominateSoldier(id: number) {
  nominated.push(id);
}

function denominateSoldier(id: number) {
  nominated.splice(
    nominated.findIndex((nominatedId) => nominatedId === id),
    1
  );
}
async function callCreateDrill() {
  console.log({nominated});
  
  try {
    if (drill.id) {
      await updateDrill(drill, nominated);
    } else {
      await createDrill(drill, nominated);
    }
    useRouter;
  } catch (error) {
    window.alert(error);
  }
}
</script>

<style lang="scss">
.drill-new {
  .form {
    width: 500px;
    .input-row {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 2fr;
    }
  }
}
</style>
