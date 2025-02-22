<template>
  <section class="drill-new">
    <div class="form">
      <div class="input-row">
        <label for="name">Název cvičení</label>
        <NInput
          id="name"
          type="text"
          placeholder=""
          v-model:value="drillSrc.name"
        />
      </div>
      <div class="input-row">
        <label for="date">Datum cvičení</label>
        <NDatePicker
          v-model:value="dateRange"
          type="daterange"
          :update-value-on-close="true"
          @update:value="updateDateRange"
        />
      </div>
      <div class="input-row">
        <label for="returnDate">Datum návratu</label>
        <NDatePicker
          id="returnDate"
          v-model:value="returnDate"
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
          v-model:value="drillSrc.additionalInfo"
        />
      </div>
      <div class="input-row">
        <label for="additionlaInfo">Nabídnout ubytování</label>
        <NCheckbox
          id="offerAccommodation"
          :checked-value="1"
          :unchecked-value="0"
          v-model:checked="drillSrc.offerAccommodation"
        />
      </div>
    </div>
    <NButton
      :disabled="!drillSrc.dateFrom || !drillSrc.dateTo"
      @click="showSoldierSelector = true"
    >
      Vybrat vojáky{{ nominatedSoldiers.length ? ` (${nominatedSoldiers.length})` : ''}}
    </NButton>
    <NButton
      :disabled="!drillSrc.dateFrom || !drillSrc.dateTo"
      @click="callCreateDrill"
      >Uložit</NButton
    >
    <NModal
      v-model:show="showSoldierSelector"
      class="custom-card"
      preset="card"
      :style="{ maxWidth: '80vw', maxHeight: '80vh' }"
      title="Nominace"
      :bordered="false"
      size="huge"
    >
      <NDataTable
        striped
        :columns="columns"
        :data="soldiers"
        :row-key="(row: RowData) => row.personalNumber"
        :default-checked-row-keys="nominatedSoldiers"
        max-height="50vh"
        @update:checked-row-keys="handleCheck"
      />
      <template #action>
        <NButton @click="callCreateDrill">Potvrdit výběr</NButton>
        <NButton
          type="error"
          @click="revertNominations"
          >Zahodit změny</NButton
        >
      </template>
    </NModal>
  </section>
</template>

<script setup lang="ts">
import {
  NButton,
  NDatePicker,
  NModal,
  NInput,
  NCheckbox,
  NDataTable,
  type DataTableRowKey,
} from "naive-ui";
import type { RowData } from "naive-ui/es/data-table/src/interface";
import type { PropType } from "vue";
import type { IDrill, ISoldier } from "~/types";

const { drill, nominated } = defineProps({
    drill: Object as PropType<IDrill>,
    nominated: {
      type: Array<number>,
      default: [],
    },
  }),
  drillSrc = ref(
    drill || {
      id: null as unknown as number,
      name: null,
      dateFrom: null,
      dateTo: null,
      returnDate: null,
      additionalInfo: null,
      offerAccommodation: false,
    }
  ),
  nominatedSoldiers = ref(nominated),
  showSoldierSelector = ref(false),
  dateRange = ref<[number, number]>([
    new Date(drillSrc.value.dateFrom || Date.now()).getTime(),
    new Date(drillSrc.value.dateTo || Date.now()).getTime(),
  ]),
  returnDate = ref(
    drillSrc.value.returnDate
      ? new Date(drillSrc.value.dateTo).getTime()
      : undefined
  ),
  columns = computed(() => {
    const squadFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (!acc.some((soldier) => soldier.squad === currentValue.squad))
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: item.squad,
            value: item.squad,
          };
        })
        .sort((item1, item2) => item1.value - item2.value),
      platoonFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (!acc.some((soldier) => soldier.platoon === currentValue.platoon))
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: item.platoon,
            value: item.platoon,
          };
        })
        .sort((item1, item2) => item1.value - item2.value),
      positionFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (
            !acc.some(
              (soldier) => soldier.position.id === currentValue.position.id
            )
          )
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: item.position.position,
            value: item.position.id,
          };
        })
        .sort((item1, item2) => item1.value - item2.value),
      rankFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (!acc.some((soldier) => soldier.rank.id === currentValue.rank.id))
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: item.rank.rank,
            value: item.rank.id,
          };
        })
        .sort((item1, item2) => item1.value - item2.value);
    return [
      {
        type: "selection",
      },
      {
        title: "Osobní číslo",
        key: "personalNumber",
        sorter: (soldier1: ISoldier, soldier2: ISoldier) =>
          soldier1.personalNumber - soldier2.personalNumber,
        defaultSortOrder: "ascend",
      },
      {
        title: "Hodnost",
        key: "rank",
        render(soldier: ISoldier) {
          return h("span", soldier.rank.abbreviation + ".");
        },
        sorter: (soldier1: ISoldier, soldier2: ISoldier) =>
          soldier1.rank.id - soldier2.rank.id,
        filterOptions: rankFiltrOptions,
        filter(rank: number, soldier: ISoldier) {
          return soldier.rank.id === rank;
        },
      },
      {
        title: "Jméno",
        key: "firstname",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) =>
            soldier1.firstname.localeCompare(soldier2.firstname),
          multiple: 5,
        },
      },
      {
        title: "Příjmení",
        key: "lastname",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) =>
            soldier1.lastname.localeCompare(soldier2.lastname),
          multiple: 6,
        },
      },
      {
        title: "Pozice",
        key: "position",
        render(soldier: ISoldier) {
          return h("span", soldier.position.position);
        },
        sorter: (soldier1: ISoldier, soldier2: ISoldier) =>
          soldier1.position.position.localeCompare(soldier2.position.position),
        filterOptions: positionFiltrOptions,
        filter(position: number, soldier: ISoldier) {
          return soldier.position.id === position;
        },
      },
      {
        title: "Četa",
        key: "platoon",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) =>
            (soldier1.platoon || 0) - (soldier2.platoon || 0),
          multiple: 2,
        },
        filterOptions: platoonFiltrOptions,
        filter(platoon: number, soldier: ISoldier) {
          return soldier.platoon === platoon;
        },
      },
      {
        title: "Družstvo",
        key: "squad",
        sorter: {
          compare: (soldier1: ISoldier, soldier2: ISoldier) =>
            (soldier1.squad || 0) - (soldier2.squad || 0),
          multiple: 1,
        },
        filterOptions: squadFiltrOptions,
        filter(squad: number, soldier: ISoldier) {
          return soldier.squad === squad;
        },
      },
      {
        title: "Lékařská prohlídka",
        key: "medicalExaminationDue",
        filterOptions: [
          {
            label: "K dnešnímu datu",
            value: Date.now(),
          },
          {
            label:
              "K datu začátku cvičení " +
              new Date(drillSrc.value.dateFrom).toLocaleDateString("cs"),
            value: new Date(drillSrc.value.dateFrom || Date.now()).getTime(),
          },
          {
            label:
              "K datu konce cvičení " +
              new Date(drillSrc.value.dateTo).toLocaleDateString("cs"),
            value: new Date(drillSrc.value.dateTo || Date.now()).getTime(),
          },
        ],
        filter(value: number, soldier: ISoldier) {
          return new Date(soldier.medicalExaminationDue).getTime() >= value;
        },
        render(soldier: ISoldier) {
          return h(
            "span",
            new Date(soldier.medicalExaminationDue).toLocaleDateString("cs")
          );
        },
      },
    ];
  }),
  soldiers = ref(
    await getSoldiers({
      sortBy: "personalNumber",
      direction: "asc",
    })
  );

function handleCheck(rowKeys: DataTableRowKey[]) {
  nominatedSoldiers.value = rowKeys;
}

function revertNominations() {
  nominatedSoldiers.value = nominated;
  showSoldierSelector.value = false;
}

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

  drillSrc.value.dateFrom = from;
  drillSrc.value.dateTo = to;
}

function isDateDisabled(ts: number) {
  return ts < dateRange.value[0] || ts > dateRange.value[1];
}

function updateReturnDate() {
  const dateSource = new Date(returnDate.value),
    year = dateSource.getFullYear(),
    month = dateSource.getMonth() + 1,
    day = dateSource.getDate();

  drillSrc.value.returnDate = `${year}-${(month < 10 ? "0" : "") + month}-${
    (day < 10 ? "0" : "") + day
  }`;
}

async function callCreateDrill() {
  let target;
  try {
    if (drillSrc.value.id) {
      target = drillSrc.value.id;
      await updateDrill(drillSrc.value, nominatedSoldiers.value);
    } else {
      target = await createDrill(drillSrc.value, nominatedSoldiers.value);
    }
    if (target) {
      useRouter().push("/drills/" + target);
    }
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
