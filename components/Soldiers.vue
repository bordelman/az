<template>
  <NDataTable
    striped
    :columns="columns"
    :data="soldiers"
    :row-key="(row: RowData) => row.personalNumber"
  />
</template>

<script setup lang="ts">
import { NDataTable, NTable } from "naive-ui";
import { getSoldiers } from "@/utils/api";
import type { ISoldier } from "~/types";

const { medicalExaminationDue } = defineProps({
    medicalExaminationDue: {
      type: String,
      default: "1970-01-01",
    },
  }),
  logged = useState<ISoldier>("logged"),
  sortBy = ref("personalNumber"),
  direction = ref("asc"),
  soldiers: Ref<Array<ISoldier>> = ref([]),
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
      companyFiltrOptions = soldiers.value
        .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
          if (!acc.some((soldier) => soldier.company === currentValue.company))
            acc.push(currentValue);
          return acc;
        }, [])
        .map((item) => {
          return {
            label: item.company,
            value: item.company,
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
        .sort((item1, item2) => item1.value - item2.value),
      columns = [
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
          sorter: {
            compare: (soldier1: ISoldier, soldier2: ISoldier) =>
              soldier1.position.position.localeCompare(
                soldier2.position.position
              ),
            multiple: 7,
          },
          filterOptions: positionFiltrOptions,
          filter(position: number, soldier: ISoldier) {
            return soldier.position.id === position;
          },
        },
        {
          title: "Rota",
          key: "company",
          sorter: {
            compare: (soldier1: ISoldier, soldier2: ISoldier) =>
              soldier1.company - soldier2.company,
            multiple: 10,
          },
          filterOptions: companyFiltrOptions,
          filter(company: number, soldier: ISoldier) {
            return soldier.company === company;
          },
        },
        {
          title: "Četa",
          key: "platoon",
          sorter: {
            compare: (soldier1: ISoldier, soldier2: ISoldier) =>
              (soldier1.platoon || 0) - (soldier2.platoon || 0),
            multiple: 9,
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
            multiple: 8,
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

    if (logged.value.rank.id < 7) {
      columns.pop();
      columns.shift();
    }

    return columns;
  });

function changeOrder(param) {
  if (param === sortBy.value) {
    direction.value = direction.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = param;
    direction.value = "asc";
  }
}

watch(
  [sortBy, direction],
  async ([sortBy, direction]) => {
    soldiers.value = await getSoldiers({
      sortBy,
      direction,
      medicalExaminationDue,
    });
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss" scoped>
.active {
  &.asc {
    &::after {
      content: "\2191";
    }
  }
  &.desc {
    &::after {
      display: inline-block;
      content: "\2193";
    }
  }
}
</style>
