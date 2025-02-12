<template>
  <section class="drill-new">
    <div class="form">
      <div class="input-row">
        <label for="name">Název cvičení</label>
        <NInput
          id="name"
          type="text"
          placeholder=""
          v-model:value="drill.name"
        />
      </div>

      <div class="input-row">
        <label for="date">Datum cvičení</label>
        <NDatePicker
          v-model:value="dateRange"
          type="daterange"
          :update-value-on-close="true"
          format="d.M.yyyy"
          @update:value="updateDateRange"
        />
      </div>
      <div class="input-row">
        <label for="returnDate">Datum návratu</label>
        <NDatePicker
          id="returnDate"
          v-model:value="returnDate"
          format="d.M.yyyy"
          placeholder=""
          :is-date-disabled="isDateDisabled"
          @update:value="updateReturnDate"
        />
      </div>
      <div class="input-row">
        <label for="additionlaInfo">Dodatečné info</label>
        <NInput
          id="additionlaInfo"
          type="text"
          placeholder=""
          v-model:value="drill.additionalInfo"
        />
      </div>
    </div>
    <NButton @click="showSoldierSelector = true"> Přidat vojáky </NButton>
    <NButton @click="callCreateDrill">Uloži</NButton>
    <NModal
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
        <Soldiers
          :exclude="nominatedSoldiers"
          :click-action="nominateSoldier"
          :medical-examination-due="drill.dateTo"
        />
      </div>
      <div class="group">
        <div class="group-heading">Nominovaní</div>
        <Soldiers
          :include="nominatedSoldiers"
          :click-action="denominateSoldier"
          :medical-examination-due="drill.dateTo"
        />
      </div>
    </NModal>
  </section>
</template>

<script setup lang="ts">
import { NButton, NDatePicker, NModal, NInput } from "naive-ui";
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
  nominatedSoldiers = ref(nominated),
  showSoldierSelector = ref(false),
  dateRange = ref<[number, number]>([
    new Date(drill.dateFrom || Date.now()).getTime(),
    new Date(drill.dateTo || Date.now()).getTime(),
  ]),
  returnDate = ref(),
  msInDay = 1000 * 60 * 60 * 24;

function updateDateRange() {
  const [from, to] = dateRange.value.map((date) => {
    const dateSource = new Date(date),
      year = dateSource.getFullYear(),
      month = dateSource.getMonth() + 1,
      day = dateSource.getDate();
    return `${year}-${(month < 10 ? "0" : "") + month}-${
      (day < 10 ? "0" : "") + day
    }`;
  });

  drill.dateFrom = from;
  drill.dateTo = to;
}

function isDateDisabled(ts: number) {
  return ts + msInDay < dateRange.value[0] || ts > dateRange.value[1];
}

function updateReturnDate() {
  const dateSource = new Date(returnDate.value),
    year = dateSource.getFullYear(),
    month = dateSource.getMonth() + 1,
    day = dateSource.getDate();

  drill.returnDate = `${year}-${(month < 10 ? "0" : "") + month}-${
    (day < 10 ? "0" : "") + day
  }`;
}

function nominateSoldier(id: number) {
  nominatedSoldiers.value.push(id);
}

function denominateSoldier(id: number) {
  nominatedSoldiers.value.splice(
    nominatedSoldiers.value.findIndex((nominatedId) => nominatedId === id),
    1
  );
}
async function callCreateDrill() {
  console.log(nominatedSoldiers.value);

  try {
    if (drill.id) {
      await updateDrill(drill, nominatedSoldiers.value);
    } else {
      await createDrill(drill, nominatedSoldiers.value);
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
