<template>
    <section class="soldier">
        <div v-if="logged.personalNumber === soldier.personalNumber">
            Osobní číslo:
            <span v-if="!edit || !logged.higherPermission">{{ soldier.personalNumber }}</span>
            <NInputNumber
                v-else
                v-model:value="soldier.personalNumber"
                :show-button="false"
                placeholder="Osobní číslo"
            />
        </div>
        <div>
            Hodnost:
            <span v-if="!edit || !logged.higherPermission">{{ soldier.rank.rank }}</span>
            <NSelect
                v-else
                v-model:value="soldier.rank.id"
                :options="rankOptions"
                placeholder="Hodnost"
            />
        </div>
        <div>
            Titul před jménem:
            <span v-if="!edit || !logged.higherPermission">{{ soldier.titleBefore }}</span>
            <NInput v-else v-model:value="soldier.titleBefore" placeholder="Titul před jménem" />
        </div>
        <div>
            Křestní jméno:
            <span v-if="!edit || !logged.higherPermission">{{ soldier.firstname }}</span>
            <NInput
                v-else
                v-model:value="soldier.firstname"
                placeholder="Křestní jméno"
            />
        </div>
        <div>
            Příjmení:
            <span v-if="!edit || !logged.higherPermission">{{ soldier.lastname }}</span>
            <NInput
                v-else
                v-model:value="soldier.lastname"
                placeholder="Příjmení"
            />
        </div>
        <div>
            Titul za jménem:
            <span v-if="!edit || !logged.higherPermission">{{ soldier.titleAfter }}</span>
            <NInput v-else v-model:value="soldier.titleAfter" placeholder="Titul za jménem" />
        </div>
        <div>
            Pracovně lékařská prohlídka do:
            <span v-if="!edit">
                {{
                    new Date(soldier.medicalExaminationDue).toLocaleDateString(
                        "cs",
                    )
                }}
            </span>
            <NDatePicker
                v-else
                v-model:value="soldier.medicalExaminationDue"
                placeholder="Pracovně lékařská prohlídka do"
                @update:value="updateReturnDate"
            />
        </div>
        <div>
            Zdravotní klasifikace:
            <span v-if="!edit || !logged.higherPermission">{{ soldier.medicalClasification }}</span>
            <NSelect
                v-else
                v-model:value="soldier.medicalClasification"
                :options="medicalClasificationOptions"
                placeholder="Zdravotní klasifikace"
            />
        </div>
        <div>
            Email:
            <a v-if="!edit" :href="'mailto:' + soldier.email">
                {{ soldier.email }}
            </a>
            <NInput v-else v-model:value="soldier.email" placeholder="Email" />
        </div>
        <div>
            Mobil:
            <a v-if="!edit" :href="'tel:+420 ' + soldier.mobile">
                {{ soldier.mobile }}
            </a>
            <NInput
                v-else
                type="tel"
                v-model:value="soldier.mobile"
                placeholder="Mobil"
            />
        </div>
        <div>
            Pozice: <span v-if="!edit || !logged.higherPermission">{{ soldier.position.position }}</span>
            <NSelect
                v-else
                v-model:value="soldier.position.id"
                :options="positionOptions"
                placeholder="Pozice"
            />
        </div>
        <div>
            Rota: <span v-if="!edit || !logged.higherPermission">{{ soldier.company }}</span>
            <NSelect
                v-else
                v-model:value="soldier.company"
                :options="companyOptions"
                placeholder="Rota"
            />
        </div>
        <div v-if="soldier.platoon || edit">
            Četa: <span v-if="!edit || !logged.higherPermission">{{ soldier.platoon }}</span>
            <NSelect
                v-else
                v-model:value="soldier.platoon"
                :options="platoonOptions"
                placeholder="Četa"
            />
        </div>
        <div v-if="soldier.squad || edit">
            Družstvo: <span v-if="!edit || !logged.higherPermission">{{ soldier.squad }}</span>
            <NSelect
                v-else
                v-model:value="soldier.squad"
                :options="squadOptions"
                placeholder="Družstvo"
            />
        </div>
        <NButton
            v-if="logged?.personalNumber === soldier.personalNumber"
            @click="showNewPasswordModal = true"
        >
            Změnit heslo
        </NButton>
        <NButton v-if="!edit" @click="edit = true"> Upravit </NButton>            
        <NButton v-else @click="callEditSoldier"> Uložit změny </NButton>
        <section class="drills">
            <h2>Moje nominace</h2>
            <section class="lists">
                <section class="attend">
                    <h2>
                        Zúčastním se
                        <span class="count"
                            >({{ nominationsPresent.length }})</span
                        >
                    </h2>
                    <ul class="nominations">
                        <li
                            class="nomination"
                            v-for="(nomination, index) of nominationsPresent"
                            :key="'nomination-' + index"
                        >
                            <NuxtLink
                                :class="[
                                    'nomination-link',
                                    EAttendance[nomination.status],
                                ]"
                                :to="'/drills/' + nomination.drill.id"
                            >
                                {{ nomination.drill.name }} ({{
                                    new Date(
                                        nomination.drill.dateFrom,
                                    ).toLocaleDateString("cs")
                                }}
                                -
                                {{
                                    new Date(
                                        nomination.drill.dateTo,
                                    ).toLocaleDateString("cs")
                                }})
                                <n-tooltip
                                    v-if="nomination.parking"
                                    trigger="hover"
                                >
                                    <template #trigger>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                        >
                                            <path
                                                d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.5 4.002h2.962C10.045 4.002 11 5.104 11 6.586c0 1.494-.967 2.578-2.55 2.578H6.784V12H5.5zm2.77 4.072c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97z"
                                            />
                                        </svg>
                                    </template>
                                    <div>{{ nomination.parking.brand }}</div>
                                    <div>{{ nomination.parking.color }}</div>
                                    <div>{{ nomination.parking.spz }}</div>
                                </n-tooltip>
                            </NuxtLink>
                        </li>
                    </ul>
                </section>
                <section class="skipped">
                    <h2>
                        Nezúčastním se
                        <span class="count"
                            >({{ nominationsAbsent.length }})</span
                        >
                    </h2>
                    <ul class="nominations">
                        <li
                            class="nomination"
                            v-for="(nomination, index) of nominationsAbsent"
                            :key="'nomination-' + index"
                        >
                            <NuxtLink
                                :class="[
                                    'nomination-link',
                                    EAttendance[nomination.status],
                                ]"
                                :to="'/drills/' + nomination.drill.id"
                            >
                                {{ nomination.drill.name }} ({{
                                    new Date(
                                        nomination.drill.dateFrom,
                                    ).toLocaleDateString("cs")
                                }}
                                -
                                {{
                                    new Date(
                                        nomination.drill.dateTo,
                                    ).toLocaleDateString("cs")
                                }})
                            </NuxtLink>
                        </li>
                    </ul>
                </section>
                <section class="not-responded">
                    <h2>
                        Nevyjádřil jsem se
                        <span class="count"
                            >({{ nominationsNotResponded.length }})</span
                        >
                    </h2>
                    <ul class="nominations">
                        <li
                            class="nomination"
                            v-for="(
                                nomination, index
                            ) of nominationsNotResponded"
                            :key="'nomination-' + index"
                        >
                            <NuxtLink
                                :class="[
                                    'nomination-link',
                                    EAttendance[nomination.status],
                                ]"
                                :to="'/drills/' + nomination.drill.id"
                            >
                                {{ nomination.drill.name }} ({{
                                    new Date(
                                        nomination.drill.dateFrom,
                                    ).toLocaleDateString("cs")
                                }}
                                -
                                {{
                                    new Date(
                                        nomination.drill.dateTo,
                                    ).toLocaleDateString("cs")
                                }})
                            </NuxtLink>
                        </li>
                    </ul>
                </section>
            </section>
        </section>
        <NModal
            v-model:show="showNewPasswordModal"
            class="custom-card"
            preset="card"
            :style="{ width: '500px', maxWidth: '80vw' }"
            title="Nové heslo"
            :bordered="false"
            size="huge"
        >
            <div class="form">
                <NInput
                    placeholder="Staré heslo"
                    v-model:value="passwords.old"
                    type="password"
                    show-password-on="click"
                />
                <NInput
                    placeholder="Nové heslo"
                    v-model:value="passwords.new"
                    type="password"
                    show-password-on="click"
                    :status="
                        passwords.new === passwords.controll
                            ? undefined
                            : 'error'
                    "
                />
                <NInput
                    placeholder="Nové heslo znovu"
                    v-model:value="passwords.controll"
                    type="password"
                    show-password-on="click"
                    :status="
                        passwords.new === passwords.controll
                            ? undefined
                            : 'error'
                    "
                />
                <NButton
                    :disabled="
                        !passwords.old || passwords.new !== passwords.controll
                    "
                    @click="callChangePassword"
                    >Změnit heslo</NButton
                >
            </div>
        </NModal>
    </section>
</template>

<script setup lang="ts">
import {
    NButton,
    NDatePicker,
    NInput,
    NInputNumber,
    NSelect,
    NModal,
    NTooltip,
} from "naive-ui";
import { EAttendance, type ISoldier } from "~/types";

const logged = useState<ISoldier>("logged"),
    edit = ref(false),
    personalNumber = (useRoute().params.personalNumber ||
        logged.value.personalNumber) as string,
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
    ],
    [soldiersArr, nominations] = await Promise.all([
        getSoldiers({ personalNumber }),
        getNominations(personalNumber),
    ]),
    soldier = ref(soldiersArr[0]),
    nominationsNotResponded = nominations.filter(
        (nomination) => nomination.status === EAttendance.NotResponded,
    ),
    nominationsPresent = nominations.filter(
        (nomination) => nomination.status === EAttendance.Present,
    ),
    nominationsAbsent = nominations.filter(
        (nomination) => nomination.status === EAttendance.Absent,
    ),
    showNewPasswordModal = ref(false),
    passwords = reactive({
        old: undefined,
        new: undefined,
        controll: undefined,
    });

async function callEditSoldier() {
    if (!soldier.value.platoon) soldier.value.platoon = null;
    if (!soldier.value.squad) soldier.value.squad = null;

    try {
        Object.assign(
            soldier.value,
            await editSoldier({
                titleAfter: soldier.value.titleAfter || null,
                titleBefore: soldier.value.titleBefore || null,
                personalNumber: soldier.value.personalNumber,
                firstname: soldier.value.firstname,
                lastname: soldier.value.lastname,
                rank: { id: soldier.value.rank.id },
                position: { id: soldier.value.position.id },
                email: soldier.value.email,
                mobile: soldier.value.mobile,
                company: soldier.value.company,
                platoon: soldier.value.platoon,
                squad: soldier.value.squad,
                medicalExaminationDue: parseDate(
                    soldier.value.medicalExaminationDue,
                ),
                medicalClasification: soldier.value.medicalClasification,
            }),
        );
        edit.value = false;
    } catch (error) {
        window.alert(error);
        console.log(error);
    }
}

function parseDate(date: Date) {
    const dateSource = new Date(date),
        year = dateSource.getFullYear(),
        month = dateSource.getMonth() + 1,
        day = dateSource.getDate();

    return `${year}-${(month < 10 ? "0" : "") + month}-${(day < 10 ? "0" : "") + day}`;
}

function callChangePassword() {
    if (!passwords.controll || !passwords.new || !passwords.old) {
        throw new Error("bad passes");
    }
    changePassword(passwords.old, passwords.new, passwords.controll);
    showNewPasswordModal.value = false;
    passwords.controll = undefined;
    passwords.old = undefined;
    passwords.new = undefined;
}
</script>

<style lang="scss" scoped>
.soldier {
    > div {
        display: grid;
        grid-template-columns: 250px 200px;
    }
    .lists {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;

        .count {
            font-size: small;
        }

        .attend {
            color: green;
        }

        .skipped {
            color: red;
        }

        .not-responded {
            color: grey;
        }

        a {
            color: inherit;
        }
    }
}
</style>
