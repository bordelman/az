<template>
    <div class="drills">
        <h1>Přehled následujících cvičení</h1>
        <n-table :single-line="false" striped>
            <thead>
                <tr>
                    <th>Název</th>
                    <th>Od</th>
                    <th>Do</th>
                    <th>Datum návratu</th>
                    <th>Počet dní</th>
                    <th>Nominace</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="drill of drills">
                    <td>
                        <NuxtLink :to="'/drills/' + drill.id">
                            {{ drill.name }}
                        </NuxtLink>
                    </td>
                    <td>
                        {{ new Date(drill.dateFrom).toLocaleDateString("cs") }}
                    </td>
                    <td>
                        {{ new Date(drill.dateTo).toLocaleDateString("cs") }}
                    </td>
                    <td>
                        {{
                            new Date(drill.returnDate).toLocaleDateString("cs")
                        }}
                    </td>
                    <td>
                        {{
                            Math.floor(
                                (new Date(drill.dateTo) -
                                    new Date(drill.dateFrom)) /
                                    86400000,
                            ) + 1
                        }}
                        ({{
                            Math.floor(
                                (new Date(drill.returnDate) -
                                    new Date(drill.dateFrom)) /
                                    86400000,
                            ) + 1
                        }})
                    </td>
                    <td
                        :class="
                            nominationsNotResponded.includes(drill.id)
                                ? 'not-responded'
                                : nominationsPresent.includes(drill.id)
                                  ? 'attend'
                                  : nominationsAbsent.includes(drill.id)
                                    ? 'skipped'
                                    : 'not-nominated'
                        "
                    >
                        {{
                            nominationsNotResponded.includes(drill.id)
                                ? "Nevyjádřil jsem se"
                                : nominationsPresent.includes(drill.id)
                                  ? "Zúčastním se"
                                  : nominationsAbsent.includes(drill.id)
                                    ? "Nezúčastním se"
                                    : "Nenominován"
                        }}
                    </td>
                </tr>
            </tbody>
        </n-table>
    </div>
</template>

<script setup lang="ts">
import { NTable } from "naive-ui";
import { EAttendance, type ISoldier } from "~/types";
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
        .map((nomination) => nomination.drill.id);
</script>

<style lang="scss" scopde>
.drills {
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
</style>
