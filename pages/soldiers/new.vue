<template>
    <section class="soldier">
        <div>
            Osobní číslo:
            <NInputNumber v-model:value="soldier.personalNumber" :show-button="false" placeholder="Osobní číslo" />
        </div>
        <div>
            Hodnost:
            <NSelect v-model:value="soldier.rank" :options="rankOptions" placeholder="Hodnost" />
        </div>
        <div>
            Titul před jménem:
            <NInput v-model:value="soldier.titleBefore" placeholder="Titul" />
        </div>
        <div>
            Křestní jméno:
            <NInput v-model:value="soldier.firstname" placeholder="Křestní jméno" />
        </div>
        <div>
            Příjmení:
            <NInput v-model:value="soldier.lastname" placeholder="Příjmení" />
        </div>
        <div>
            Titul za jménem:
            <NInput v-model:value="soldier.titleAfter" placeholder="Titul" />
        </div>
        <div>
            Pracovně lékařská prohlídka do:
            <NDatePicker v-model:value="soldier.medicalExaminationDue" placeholder="Pracovně lékařská prohlídka do" />
        </div>
        <div>
            Zdravotní klasifikace:
            <NSelect v-model:value="soldier.medicalClasification" :options="medicalClasificationOptions"
                placeholder="Zdravotní klasifikace" />
        </div>
        <div>
            Email:
            <NInput v-model:value="soldier.email" placeholder="Email" />
        </div>
        <div>
            Mobil:
            <NInput type="tel" v-model:value="soldier.mobile" placeholder="Mobil" />
        </div>
        <div>
            Pozice:
            <NSelect v-model:value="soldier.position" :options="positionOptions" placeholder="Pozice" />
        </div>
        <div>
            Rota:
            <NSelect v-model:value="soldier.company" :options="companyOptions" placeholder="Rota" />
        </div>
        <div>
            Četa:
            <NSelect v-model:value="soldier.platoon" :options="platoonOptions" placeholder="Četa" />
        </div>
        <div>
            Družstvo:
            <NSelect v-model:value="soldier.squad" :options="squadOptions" placeholder="Družstvo" />
        </div>
        <NButton @click="callCreateSoldier">Uložit</NButton>
    </section>
</template>

<script setup lang="ts">
import { NButton, NDatePicker, NInput, NInputNumber, NSelect } from "naive-ui";
import type { ISoldier } from "~/types";

const soldier: ISoldier = reactive({}),
    { positions, ranks } = useSettings(),
    positionOptions = Object.values(positions.value).map((position) => {
        return {
            label: position.position,
            value: position.id,
        };
    }),
    rankOptions = Object.values(ranks.value).map((rank) => {
        return {
            label: rank.rank,
            value: rank.id,
        };
    }),
    companyOptions = [{ label: 1, value: 1 }],
    platoonOptions = [
        { label: 1, value: 1 },
        { label: 2, value: 2 },
        { label: 3, value: 3 },
        { label: 4, value: 4 },
    ],
    squadOptions = [
        { label: 1, value: 1 },
        { label: 2, value: 2 },
        { label: 3, value: 3 },
    ],
    medicalClasificationOptions = [
        { label: "A", value: 1 },
        { label: "B", value: 2 },
        { label: "C", value: 3 },
    ];

async function callCreateSoldier() {
    if (!soldier.platoon) delete soldier.platoon;
    if (!soldier.squad) delete soldier.squad;
    soldier.medicalExaminationDue = parseDate(soldier.medicalExaminationDue);

    try {
        const soldierCreated = await createSoldier(soldier);

        useRouter().replace("/soldiers/" + soldierCreated.personalNumber);
    } catch (error) {
        console.log("soldier not created");
    }

}

function parseDate(date: Date) {
    if (date) {
        const dateSource = new Date(date),
            year = dateSource.getFullYear(),
            month = dateSource.getMonth() + 1,
            day = dateSource.getDate();

        return `${year}-${(month < 10 ? "0" : "") + month}-${(day < 10 ? "0" : "") + day}`;
    }

}
</script>

<style lang="scss" scoped>
.soldier {
    >div {
        display: grid;
        grid-template-columns: 250px 200px;
    }
}
</style>
