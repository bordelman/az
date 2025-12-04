<template>
    <div class="drills">
        <h1>Přehled následujících cvičení</h1>
        <NDataTable :columns="columns" :data="drills" :single-line="false" striped />
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from "#components";
import { NDataTable, type DataTableColumns } from "naive-ui";
import { EAttendance, type IDrill, type ISoldier } from "~/types";
const personalNumber = useState<ISoldier>("logged").value
    .personalNumber as unknown as string,
    [drills, nominations] = await Promise.all([
        getDrills(),
        getNominations(personalNumber),
    ]),
    nominationsNotResponded = nominations
        .filter((nomination) => nomination.status === EAttendance.NotResponded)
        .map((nomination) => nomination.drill.id),
    nominationsPresent = nominations
        .filter((nomination) => nomination.status === EAttendance.Present)
        .map((nomination) => nomination.drill.id),
    nominationsAbsent = nominations
        .filter((nomination) => nomination.status === EAttendance.Absent)
        .map((nomination) => nomination.drill.id),
    columns: DataTableColumns = [{
        key: "name",
        title: "Název",
        render: (row) => h(NuxtLink, { to: '/drills/' + row.id }, () => row.name)
    }, {
        key: "dateFrom",
        title: "Od",
        sorter: "default",
        defaultSortOrder: "descend",
        defaultFilterOptionValues: ["future"],
        // filterOptionValues: ['future'],  // aktivní filtr
        filterOptions: [{
            label: 'Budoucí',
            value: 'future'
        }, {
            label: 'Minulé',
            value: 'past'
        }],
        filter: (value: any, row: any) => {
            if (value === 'future') {
                return new Date(row.dateFrom) > new Date();
            }
            if (value === 'past') {
                return new Date(row.dateFrom) <= new Date();
            }
            return true
        },
        render: (row: IDrill) => new Date(row.dateFrom).toLocaleDateString("cs")
    }, {
        key: "dateTo",
        title: "Do",
        render: (row: IDrill) => new Date(row.dateTo).toLocaleDateString("cs")
    }, {
        key: "name",
        title: "Datum návratu",
        render: (row: IDrill) => new Date(row.returnDate).toLocaleDateString("cs")
    }, {
        key: "dateFrom",
        title: "Počet dní",
        render: (row: IDrill) => {
            return `${Math.floor(
                (new Date(row.dateTo).getTime() -
                    new Date(row.dateFrom).getTime()) /
                86400000,
            ) + 1} (${Math.floor(
                (new Date(row.returnDate).getTime() -
                    new Date(row.dateFrom).getTime()) /
                86400000,
            ) + 1})`
        }
    }, {
        key: "dateTo",
        title: "Nominace",
        render: (row: IDrill) => nominationsNotResponded.includes(row.id)
            ? "Nevyjádřil jsem se"
            : nominationsPresent.includes(row.id)
                ? "Zúčastním se"
                : nominationsAbsent.includes(row.id)
                    ? "Nezúčastním se"
                    : "Nenominován",
        cellProps(row: IDrill) {
            return {
                class: nominationsNotResponded.includes(row.id)
                    ? 'not-responded'
                    : nominationsPresent.includes(row.id)
                        ? 'attend'
                        : nominationsAbsent.includes(row.id)
                            ? 'skipped'
                            : 'not-nominated'
            }
        }
    }];
</script>

<style lang="scss" scoped>
.drills {
    :deep() {
        .attend {
            color: green;
        }

        .skipped {
            color: red;
        }

        .not-responded {
            color: grey;
        }
    }
}
</style>
