<template>
    <div class="soldier">
        <NInput type="text" v-model:value="term" />
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
    NInput,
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
import * as _ from "lodash-es"

const table = ref(),
    filters = ref(),
    sorters = ref(),
    term = ref(""),
    logged = useState<ISoldier>("logged"),
    soldiersSrc = await getSoldiers({}),
    soldiers: Ref<Array<ISoldier>> = ref(_.cloneDeep(soldiersSrc)),
    filteredSoldiers: Ref<Array<ISoldier>> = ref(soldiers.value),
    columns = computed((): DataTableColumns => {
        const squadFiltrOptions = filteredSoldiers.value
            .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                if (
                    !acc.some(
                        (soldier) => soldier.assignment?.squad === currentValue.assignment?.squad,
                    )
                )
                    acc.push(currentValue);
                return acc;
            }, [])
            .map((item) => {
                return {
                    label: !item.assignment || item.assignment.squad === null ? "NEVYPLNĚNO" : squadOptions[item.assignment.squad].label,
                    value: item.assignment?.squad ?? null,
                };
            })
            .sort(sortId),
            platoonFiltrOptions = filteredSoldiers.value
                .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                    if (
                        !acc.some(
                            (soldier) =>
                                soldier.assignment?.platoon === currentValue.assignment?.platoon,
                        )
                    )
                        acc.push(currentValue);
                    return acc;
                }, [])
                .map((item) => {
                    return {
                        label: !item.assignment || item.assignment.platoon === null ? "NEVYPLNĚNO" : platoonOptions[item.assignment.platoon].label,
                        value: item.assignment?.platoon ?? null,
                    };
                })
                .sort(sortId),
            companyFiltrOptions = filteredSoldiers.value
                .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                    if (
                        !acc.some(
                            (soldier) =>
                                soldier.assignment?.company === currentValue.assignment?.company,
                        )
                    )
                        acc.push(currentValue);
                    return acc;
                }, [])
                .map((item) => {
                    return {
                        label: !item.assignment || item.assignment.company === null ? "NEVYPLNĚNO" : companyOptions[item.assignment.company].label,
                        value: item.assignment?.company ?? null,
                    };
                })
                .sort(sortId),
            positionFiltrOptions = filteredSoldiers.value
                .reduce((acc: Array<ISoldier>, currentValue: ISoldier) => {
                    if (
                        !acc.some(
                            (soldier) =>
                                soldier.assignment?.position.id === currentValue.assignment?.position.id,
                        )
                    )
                        acc.push(currentValue);
                    return acc;
                }, [])
                .map((item) => {
                    return {
                        label: item.assignment?.position.position ?? "Nevyplněno",
                        value: item.assignment?.position.id ?? null,
                    };
                })
                .sort(sortId),
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
                        return h("span", soldier.assignment?.position.position);
                    },
                    sorter: {
                        compare: (soldier1: ISoldier, soldier2: ISoldier) => {
                            const pos1 = soldier1.assignment?.position.position,
                                pos2 = soldier2.assignment?.position.position;
                            if (!pos1) return -1
                            if (!pos2) return 1
                            return pos1.localeCompare(pos2)
                        },
                        multiple: 7,
                    },
                    filterOptions: positionFiltrOptions,
                    filter(position: number, soldier: ISoldier) {
                        return soldier.assignment?.position.id === position;
                    },
                },
                {
                    title: "Rota",
                    key: "company",
                    sorter: {
                        compare: (soldier1: ISoldier, soldier2: ISoldier) => {
                            if (typeof soldier1.assignment?.company !== "number") return -1;
                            if (typeof soldier2.assignment?.company !== "number") return 1;
                            return soldier1.assignment.company - soldier2.assignment.company
                        },
                        multiple: 10,
                    },
                    filterOptions: companyFiltrOptions,
                    filter(company: number, soldier: ISoldier) {
                        return soldier.assignment?.company === company;
                    },
                    render: (soldier: ISoldier) => !soldier.assignment || soldier.assignment.company === null ? "" : companyOptions[soldier.assignment.company].label
                },
                {
                    title: "Četa",
                    key: "platoon",
                    sorter: {
                        compare: (soldier1: ISoldier, soldier2: ISoldier) => {
                            const
                                plat1 = soldier1.assignment?.platoon,
                                plat2 = soldier2.assignment?.platoon;
                            if (typeof plat1 !== "number") return -1
                            if (typeof plat2 !== "number") return 1
                            return plat1 - plat2
                        },
                        multiple: 9,
                    },
                    filterOptions: platoonFiltrOptions,
                    filter(platoon: number, soldier: ISoldier) {
                        return soldier.assignment?.platoon === platoon;
                    },
                    render: (soldier: ISoldier) => !soldier.assignment || soldier.assignment.platoon === null ? "" : platoonOptions[soldier.assignment.platoon].label
                },
                {
                    title: "Družstvo",
                    key: "squad",
                    sorter: {
                        compare: (soldier1: ISoldier, soldier2: ISoldier) => {
                            const
                                squad1 = soldier1.assignment?.squad,
                                squad2 = soldier2.assignment?.squad

                            if (typeof squad1 !== "number") return -1;
                            if (typeof squad2 !== "number") return 1;
                            return squad1 - squad2
                        },
                        multiple: 8,
                    },
                    filterOptions: squadFiltrOptions,
                    filter(squad: number, soldier: ISoldier) {
                        return soldier.assignment?.squad === squad;
                    },
                    render: (soldier: ISoldier) => !soldier.assignment || soldier.assignment.squad === null ? "" : squadOptions[soldier.assignment.squad].label
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
                {
                    title: "Bezpečnostní prověrka",
                    key: "securityClearanceDue",
                    sorter: (soldier1: ISoldier, soldier2: ISoldier) => {
                        return new Date(soldier1.securityClearanceDue).getTime() - new Date(soldier2.securityClearanceDue).getTime()
                    },
                    filterOptions: [
                        {
                            label: "K dnešnímu datu",
                            value: Date.now(),
                        },
                    ],
                    filter(value: number, soldier: ISoldier) {
                        if (!soldier.securityClearanceDue) return false;
                        return (
                            new Date(soldier.securityClearanceDue).getTime() >=
                            value
                        );
                    },
                    render(soldier: ISoldier) {
                        return h(
                            "span",
                            soldier.securityClearanceDue ?
                                new Date(
                                    soldier.securityClearanceDue,
                                ).toLocaleDateString("cs") : "NEVYPLNĚNO",
                        );
                    },
                },
            ];

        if (!logged.value.higherPermission) {
            columns.pop();
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
    term.value="";
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

watch(term, (value) => {
    if (value) {
        soldiers.value = soldiersSrc.filter(soldier => findMatch(soldier.firstname, value) || findMatch(soldier.lastname, value) || soldier.personalNumber?.toString().includes(value))
    }   
    else {
        soldiers.value = _.cloneDeep(soldiersSrc)
    }
});

function findMatch(src: string, value: string): boolean {
    return src.toLocaleLowerCase().includes(value.toLocaleLowerCase())
}

function sortId(item1: { value: number | null }, item2: { value: number | null }) {
    if (!item1.value) {
        return -1
    }
    else if (!item2.value) {
        return 1
    }
    return item1.value - item2.value
}
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
