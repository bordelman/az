<template>
    <NuxtPage v-if="useRoute().path.includes('edit')" :drill="drill" :nominated="nominated" />
    <section v-else class="drill">
        <h1 class="drill-name">
            <NuxtLink :class="{ 'drill-edit-link': logged.higherPermission }"
                :to="logged.higherPermission ? `/drills/${id}/edit` : undefined">
                {{ drill.name }}
            </NuxtLink>
        </h1>
        <div>
            {{ new Date(drill.dateFrom).toLocaleDateString("cs") }} -
            {{ new Date(drill.dateTo).toLocaleDateString("cs") }} ({{
                new Date(drill.returnDate).toLocaleDateString("cs")
            }})
            <div class="controll-panel" v-if="logged.higherPermission">
                <NButton type="error" @click="callRemoveDrill">
                    Zrušit cvičení
                </NButton>
            </div>
        </div>
        <NCard v-if="drill.additionalInfo" title="Dodatečné informace">
            <div class="additional-info" v-html="drill.additionalInfo" />
        </NCard>
        <!-- <section class="additional-info">
      <a href="">Dodatečné info</a>
    </section> -->
        <section v-if="nominated.includes(logged.personalNumber)" class="controll-panel">
            <NButton ghost type="primary" v-if="!alreadyIn" @click="showParkingModal = true">
                Zúčastním se
            </NButton>
            <NButton ghost type="error" v-if="!alreadyAbsent" class="negative" @click="removeMe">
                Nezúčastním se
            </NButton>
        </section>
        <section v-else>Nebyl jste nominován</section>
        <div>
            <NButton v-if="logged.position.id === 69010" @click="toggleSquadFilter">{{ showSquad ? "Zobrazit všechny" :
                "Zobrazit pouze vlastní družstvo" }}</NButton>
        </div>
        <section class="lists">
            <section class="attendents">
                <h2>
                    Zúčastní se
                    <span class="count">({{ present.length }})</span>
                    <div v-if="logged.higherPermission">
                        <NButton @click="exportCsv('complet')">vše</NButton>
                        <NButton @click="exportCsv('parking')">parkování</NButton>
                        <NButton @click="exportCsv('accommodation')">ubytování</NButton>
                    </div>
                </h2>
                <ul v-if="!isLoading" class="soldiers">
                    <li class="soldier" v-for="(nomination, index) of present" :key="'soldier-' + index">
                        <SoldierLink :soldier="nomination.soldier" />
                        <NTooltip v-if="nomination.parking" trigger="hover">
                            <template #trigger>
                                <div class="badge">P</div>
                            </template>
                            <div>Parkování:</div>
                            <div>
                                Značka vozu: {{ nomination.parking.brand }}
                            </div>
                            <div>Barva: {{ nomination.parking.color }}</div>
                            <div>SPZ: {{ nomination.parking.spz }}</div>
                        </NTooltip>
                        <NTooltip v-if="nomination.accommodation" trigger="hover">
                            <template #trigger>
                                <div class="badge">U</div>
                            </template>
                            Zažádal o poskytnutí ubytování
                        </NTooltip>
                        <NTooltip v-if="nomination.soldier.personalNumber == myId">
                            <template #trigger>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="16px" width="16px"
                                    @click="editNomination">
                                    <path
                                        d="m487.4 315.7-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3l-42.6 24.6c-17.9-15.4-38.5-27.3-60.8-35.1v-49.1c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7v49.2c-22.2 7.9-42.8 19.8-60.8 35.1l-42.5-24.6c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14l42.6 24.6c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zm-231.4 20.3c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
                                </svg>
                            </template>
                            Upravit parkování{{
                                drill.offerAccommodation ? "/ubytování" : ""
                            }}
                        </NTooltip>
                    </li>
                </ul>
            </section>
            <section class="skipped">
                <h2>
                    Nezúčastní se
                    <span class="count">({{ absent.length }})</span>
                </h2>
                <ul v-if="!isLoading" class="soldiers">
                    <li class="soldier" v-for="(nomination, index) of absent" :key="'soldier-' + index">
                        <SoldierLink :soldier="nomination.soldier" />
                    </li>
                </ul>
            </section>
            <section class="not-responded">
                <h2>
                    Nevyjádřil se
                    <span class="count">({{ notResponded.length }})</span>
                </h2>
                <ul v-if="!isLoading" class="soldiers">
                    <li class="soldier" v-for="(nomination, index) of notResponded" :key="'soldier-' + index">
                        <SoldierLink :soldier="nomination.soldier" />
                    </li>
                </ul>
            </section>
        </section>
        <NModal v-model:show="showParkingModal" class="custom-card" preset="card" :style="{ maxWidth: '60ch' }"
            title="Parkování" :bordered="false" size="huge">
            <div class="input-row">
                <NInput v-model:value="parking.brand" placeholder="Značka vozu" />
            </div>
            <div class="input-row">
                <NInput v-model:value="parking.color" placeholder="Barva" />
            </div>
            <div class="input-row">
                <NInput v-model:value="parking.spz" placeholder="SPZ" />
            </div>
            <div v-if="drill.offerAccommodation" class="input-row">
                <NCheckbox v-model:checked="accommodation">Chci ubytování
                </NCheckbox>
            </div>
            <NButton @click="addMe">
                {{
                    Object.values(parking).every((item) => item)
                        ? "Zúčastním se s parkováním"
                        : "Zúčastním se bez parkování"
                }}
            </NButton>
        </NModal>
    </section>
</template>

<script setup lang="ts">
import { NButton, NCard, NCheckbox, NInput, NModal, NTooltip } from "naive-ui";
import { EAttendance, type IParking, type ISoldier } from "~/types";

const { isLoading } = useLayout(),
    logged = useState<ISoldier>("logged"),
    myId = logged.value.personalNumber,
    { id } = useRoute().params as unknown as { id: string },
    showParkingModal = ref(false),
    parking: Ref<IParking> = ref({ color: "", spz: "", brand: "" }),
    drill = ref((await getDrills({ id }))[0]),
    nominations = ref(await getDrillNominations(id)),
    showSquad = ref(false),
    myNomination = computed(() =>
        nominations.value.find(
            (nomination) => nomination.soldier.personalNumber === myId,
        ),
    ),
    present = computed(() =>
        nominations.value
            .filter((nomination) => nomination.status === EAttendance.Present)
            .filter((nomination) => {
                if (showSquad.value) {
                    const { company, platoon, squad } = nomination.soldier
                    return company === logged.value.company && platoon === logged.value.platoon && squad === logged.value.squad
                }
                return true
            })
            .sort((a, b) =>
                a.soldier.lastname.localeCompare(b.soldier.lastname),
            ),
    ),
    absent = computed(() =>
        nominations.value
            .filter((nomination) => nomination.status === EAttendance.Absent)
            .filter((nomination) => {
                if (showSquad.value) {
                    const { company, platoon, squad } = nomination.soldier
                    return company === logged.value.company && platoon === logged.value.platoon && squad === logged.value.squad
                }
                return true
            })
            .sort((a, b) =>
                a.soldier.lastname.localeCompare(b.soldier.lastname),
            ),
    ),
    notResponded = computed(() =>
        nominations.value
            .filter((nomination) => nomination.status === EAttendance.NotResponded)
            .filter((nomination) => {
                if (showSquad.value) {
                    const { company, platoon, squad } = nomination.soldier
                    return company === logged.value.company && platoon === logged.value.platoon && squad === logged.value.squad
                }
                return true
            })
            .sort((a, b) =>
                a.soldier.lastname.localeCompare(b.soldier.lastname),
            ),
    ),
    nominated = computed(() =>
        nominations.value.map(
            (nomination) => nomination.soldier.personalNumber,
        ),
    ),
    alreadyAbsent = computed(() =>
        absent.value.some(
            (nomination) => nomination.soldier.personalNumber === myId,
        ),
    ),
    alreadyIn = computed(() =>
        present.value.some(
            (nomination) => nomination.soldier.personalNumber === myId,
        ),
    ),
    accommodation = ref(false);

watch(
    () => drill.value.id,
    async (newId) => {
        if (newId) {
            const [drillsArrSrc, nominationsSrc] = await Promise.all([
                getDrills({ id }),
                getDrillNominations(id),
            ]);
            drill.value = drillsArrSrc[0];
            nominations.value = nominationsSrc;
        }
    },
);

function toggleSquadFilter() {
    showSquad.value = !showSquad.value;
}

async function callRemoveDrill() {
    await removeDrill(drill.value.id);

    useRouter().replace("/drills");
}

async function editNomination() {
    if (myNomination.value?.parking) {
        parking.value = myNomination.value?.parking as IParking;
    }
    accommodation.value = !!myNomination.value?.accommodation;
    showParkingModal.value = true;
}

async function addMe() {
    const parkingNom = Object.values(parking.value).every((item) => item)
        ? parking.value
        : undefined;

    nominations.value = await reactToNomination(id, EAttendance.Present, {
        parking: parkingNom,
        accommodation: accommodation.value,
    });

    showParkingModal.value = false;
    parking.value = { color: "", spz: "", brand: "" };
}

async function removeMe() {
    nominations.value = await reactToNomination(id, EAttendance.Absent);
}

function exportCsv(parameter: "complet" | "parking" | "accommodation") {
    let fileName = "";

    const headRow = ["Osobní číslo", "Hodnost", "Jméno", "Příjmení"],
        data: Array<string | number> = [],
        addRow = (row: Array<string | number>) => {
            data.push(row.join(";") + "\n");
        },
        a = document.createElement("a");

    switch (parameter) {
        case "accommodation":
            fileName = "Ubytování";
            break;
        case "complet":
            headRow.push("Ubytování", "Parkování");
            fileName = "Komplet";
            break;
        case "parking":
            headRow.push("Parkování");
            fileName = "Parkování";
            break;
    }
    addRow(headRow);

    for (const nomination of present.value) {
        const { accommodation, parking, soldier } = nomination,
            { firstname, lastname, personalNumber, rank } = soldier,
            row = [personalNumber, rank.rank, firstname, lastname],
            rowAccommodation = accommodation ? "Ano" : "Ne",
            rowParking = parking
                ? Object.values(parking || {}).join(", ")
                : "Ne";

        switch (parameter) {
            case "accommodation":
                if (accommodation) {
                    addRow(row);
                }
                break;
            case "complet":
                row.push(rowAccommodation, rowParking);
                addRow(row);
                break;
            case "parking":
                if (parking) {
                    row.push(rowParking);
                    addRow(row);
                }
                break;
        }
    }

    a.href = window.URL.createObjectURL(new Blob(["\uFEFF" + data.join("")], { type: "application/vnd.ms-excel;charset=utf-8;" }));
    a.download = `${fileName} - ${drill.value.name}.csv`;
    a.click();
}
</script>

<style lang="scss" scoped>
.drill {
    .drill-name {
        .drill-edit-link {
            &::after {
                display: inline-block;
                content: "\270e";
                padding-left: 8px;
            }
        }
    }

    .additional-info {
        white-space: break-spaces;
    }

    .controll-panel {
        display: inline-flex;
        gap: 1rem;
    }

    .lists {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;

        .count {
            font-size: small;
        }

        .attendents {
            color: green;

            .soldier {
                display: flex;
                align-items: center;
                gap: 5px;

                svg {
                    cursor: pointer;

                    path {
                        fill: currentColor;
                    }
                }

                .badge {
                    cursor: pointer;
                    display: flex;
                    aspect-ratio: 1;
                    border-radius: 100%;
                    border: 1px solid currentColor;
                    height: 18px;
                    width: 18px;
                    justify-content: center;
                    align-items: center;
                }
            }
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
