<template>
    <div class="soldier">
        <div class="clear-button">
            <NButton v-if="filters" @click="clearFilters">Restartovat filtry</NButton>
            <NButton v-if="sorters" @click="clearSorter">Restartovat řazení</NButton>
        </div>
        <div :style="{ width: '100%', maxWidth: '90vw', margin: 'auto' }">
            <NDataTable ref="table" striped :columns="columns" :data="soldiers"
                :row-key="(row: RowData) => row.personalNumber" :row-props="rowProps"
                :on-update:filters="onFilterChange" :on-update:sorter="onSorterChange" />
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    NButton,
    NDataTable,
    type DataTableColumns,
    type DataTableFilterState,
    type DataTableSortState
} from "naive-ui";
import { getSoldiers } from "@/utils/api";
import type { ISoldier } from "~/types";
import type { RowData } from "naive-ui/es/data-table/src/interface";
import {
    companyOptions,
    platoonOptions,
    squadOptions
} from "~/types"

const table = ref(),
    filters = ref(),
    sorters = ref(),
    logged = useState<ISoldier>("logged"),
    soldiers: Ref<Array<ISoldier>> = ref(
        await getSoldiers({}),
    ),
    filteredSoldiers: Ref<Array<ISoldier>> = ref(soldiers.value),
    columns = computed((): DataTableColumns => {
        const squadFiltrOptions = filteredSoldiers.value
            .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                if (
                    !acc.some(
                        (soldier) => soldier.squad === currentValue.squad,
                    )
                )
                    acc.push(currentValue);
                return acc;
            }, [])
            .map((item) => {
                return {
                    label: item.squad === null ? "NEVYPLNĚNO" : squadOptions[item.squad].label,
                    value: item.squad,
                };
            })
            .sort((item1, item2) => item1.value - item2.value),
            platoonFiltrOptions = filteredSoldiers.value
                .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                    if (
                        !acc.some(
                            (soldier) =>
                                soldier.platoon === currentValue.platoon,
                        )
                    )
                        acc.push(currentValue);
                    return acc;
                }, [])
                .map((item) => {
                    return {
                        label: item.platoon === null ? "NEVYPLNĚNO" : platoonOptions[item.platoon].label,
                        value: item.platoon,
                    };
                })
                .sort((item1, item2) => item1.value - item2.value),
            companyFiltrOptions = filteredSoldiers.value
                .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                    if (
                        !acc.some(
                            (soldier) =>
                                soldier.company === currentValue.company,
                        )
                    )
                        acc.push(currentValue);
                    return acc;
                }, [])
                .map((item) => {
                    return {
                        label: item.company === null ? "NEVYPLNĚNO" : companyOptions[item.company].label,
                        value: item.company,
                    };
                })
                .sort((item1, item2) => item1.value - item2.value),
            positionFiltrOptions = filteredSoldiers.value
                .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                    if (
                        !acc.some(
                            (soldier) =>
                                soldier.position.id ===
                                currentValue.position.id,
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
            rankFiltrOptions = filteredSoldiers.value
                .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                    if (
                        !acc.some(
                            (soldier) =>
                                soldier.rank.id === currentValue.rank.id,
                        )
                    )
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
            columns: DataTableColumns = [
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
                            soldier1.firstname.localeCompare(
                                soldier2.firstname,
                            ),
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
                                soldier2.position.position,
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
                        compare: (soldier1: ISoldier, soldier2: ISoldier) => {
                            if (soldier1 === null) return -1;
                            return soldier1.company - soldier2.company
                        },
                        multiple: 10,
                    },
                    filterOptions: companyFiltrOptions,
                    filter(company: number, soldier: ISoldier) {
                        return soldier.company === company;
                    },
                    render: (soldier: ISoldier) => soldier.company === null ? "NEVYPLNĚNO" : companyOptions[soldier.company].label
                },
                {
                    title: "Četa",
                    key: "platoon",
                    sorter: {
                        compare: (soldier1: ISoldier, soldier2: ISoldier) => {
                            if (soldier1.platoon === null) return -1;
                            return soldier1.platoon - (soldier2.platoon || 0)
                        },
                        multiple: 9,
                    },
                    filterOptions: platoonFiltrOptions,
                    filter(platoon: number, soldier: ISoldier) {
                        return soldier.platoon === platoon;
                    },
                    render: (soldier: ISoldier) => soldier.platoon === null ? "NEVYPLNĚNO" : platoonOptions[soldier.platoon].label
                },
                {
                    title: "Družstvo",
                    key: "squad",
                    sorter: {
                        compare: (soldier1: ISoldier, soldier2: ISoldier) => {
                            if (soldier1.squad === null) return -1;
                            return soldier1.squad - (soldier2.squad || 0)
                        },
                        multiple: 8,
                    },
                    filterOptions: squadFiltrOptions,
                    filter(squad: number, soldier: ISoldier) {
                        return soldier.squad === squad;
                    },
                    render: (soldier: ISoldier) => soldier.squad === null ? "NEVYPLNĚNO" : squadOptions[soldier.squad].label
                },
                {
                    title: "Lékařská prohlídka",
                    key: "medicalExaminationDue",
                    sorter: (soldier1: ISoldier, soldier2: ISoldier) => {
                        return new Date(soldier1.medicalExaminationDue).getTime() - new Date(soldier2.medicalExaminationDue).getTime()
                    },
                    filterOptions: [
                        {
                            label: "K dnešnímu datu",
                            value: Date.now(),
                        },
                    ],
                    filter(value: number, soldier: ISoldier) {
                        if (!soldier.medicalExaminationDue) return false;
                        return (
                            new Date(soldier.medicalExaminationDue).getTime() >=
                            value
                        );
                    },
                    render(soldier: ISoldier) {
                        return h(
                            "span",
                            soldier.medicalExaminationDue ?
                                new Date(
                                    soldier.medicalExaminationDue,
                                ).toLocaleDateString("cs") : "NEVYPLNĚNO",
                        );
                    },
                },
            ];

        if (!logged.value.higherPermission) {
            columns.pop();
            columns.shift();
        }

        return columns;
    }),
    rowProps = (row: ISoldier) => {
        if (logged.value.higherPermission) {
            return {
                style: "cursor: pointer;",
                onClick: () => {
                    useRouter().push("/soldiers/" + row.personalNumber);
                },
            };
        }
    };

function clearFilters() {
    table.value.filter(null);
    filters.value = null;
}

function clearSorter() {
    table.value.sort(null);
    sorters.value = null;
}
function onFilterChange(filtersSrc: DataTableFilterState) {
    filters.value = filtersSrc;
}
function onSorterChange(sortersSrc: DataTableSortState) {
    if (Array.isArray(sortersSrc)) {
        if (sortersSrc.every((sorter) => !sorter.order)) {
            return (sorters.value = null);
        }
    } else if (!sortersSrc?.order) {
        return (sorters.value = null);
    }

    sorters.value = sortersSrc;
}
watch(filters, () => {
    filteredSoldiers.value = table.value.paginatedData.map(
        (row: { rawNode: ISoldier }) => row.rawNode,
    );
});
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
