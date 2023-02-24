<template>
	<NuxtPage v-if="useRoute().path.includes('edit')" :drill="drill" :nominated="nominated" />
	<section v-else class="drill">
		<h1 class="drill-name">
			<NuxtLink :class="{'drill-edit-link': logged.position.id === 10}"
				:to="logged.position.id === 10 ? `/drills/${drill.id}/edit` : undefined">
				{{ drill.name }}
			</NuxtLink>
		</h1>
		<p>
			{{ new Date(drill.dateFrom).toLocaleDateString() }} - {{ new Date(drill.dateTo).toLocaleDateString() }} ({{ new
				Date(drill.returnDate).toLocaleDateString() }})
		<div class="controll-panel" v-if="logged.position.id === 10">
			<n-button type="error" @click="callRemoveDrill">Zrušit cvičení</n-button>
		</div>
		</p>

		<section v-if="nominated.includes(logged.personalNumber)" class="controll-panel">
			<n-button ghost type="primary" v-if="!alreadyIn" @click="showParkingModal = true">Zúčastním se</n-button>
			<n-button ghost type="error" v-if="!alreadyAbsent" class="negative" @click="removeMe">Nezúčastním se</n-button>
		</section>
		<section v-else>Nebyl jste nominován</section>
		<section class="lists">
			<section class="attendents">
				<h2>
					Zúčastní se <span class="count">({{ present.length }})</span>
				</h2>
				<ul class="soldiers">
					<li class="soldier" v-for="(nomination, index) of present" :key="'soldier-' + index">
						<NuxtLink :to="'/soldiers/' + nomination.soldier.personalNumber">
							{{ nomination.soldier.firstname }}
							{{ nomination.soldier.lastname }},
							{{ nomination.soldier.rank.abbreviation }}.
						</NuxtLink>
						<n-tooltip v-if="nomination.parking" trigger="hover">
							<template #trigger>
								<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
									<path
										d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.5 4.002h2.962C10.045 4.002 11 5.104 11 6.586c0 1.494-.967 2.578-2.55 2.578H6.784V12H5.5zm2.77 4.072c.893 0 1.419-.545 1.419-1.488s-.526-1.482-1.42-1.482H6.778v2.97z" />
								</svg>
							</template>
							<div>{{ nomination.parking.brand }}</div>
							<div>{{ nomination.parking.color }}</div>
							<div>{{ nomination.parking.spz }}</div>
						</n-tooltip>
					</li>
				</ul>
			</section>
			<section class="skipped">
				<h2>
					Nezúčastní se <span class="count">({{ absent.length }})</span>
				</h2>
				<ul class="soldiers">
					<li class="soldier" v-for="(nomination, index) of absent" :key="'soldier-' + index">
						<NuxtLink :to="'/soldiers/' + nomination.soldier.personalNumber">
							{{ nomination.soldier.firstname }}
							{{ nomination.soldier.lastname }},
							{{ nomination.soldier.rank.abbreviation }}.
						</NuxtLink>
					</li>
				</ul>
			</section>
			<section class="not-responded">
				<h2>
					Nevyjádřil se <span class="count">({{ notResponded.length }})</span>
				</h2>
				<ul class="soldiers">
					<li class="soldier" v-for="(nomination, index) of notResponded" :key="'soldier-' + index">
						<NuxtLink :to="'/soldiers/' + nomination.soldier.personalNumber">
							{{ nomination.soldier.firstname }}
							{{ nomination.soldier.lastname }},
							{{ nomination.soldier.rank.abbreviation }}.
						</NuxtLink>
					</li>
				</ul>
			</section>
		</section>
		<section class="additional-info">
			<a href="">Dodatečné info</a>
		</section>
		<n-modal v-model:show="showParkingModal" class="custom-card" preset="card" :style="{maxWidth: '60ch'}"
			title="Parkování" :bordered="false" size="huge">
			<div class="input-row">
				<n-input v-model:value="parking.brand" placeholder="Značka vozu" />
			</div>
			<div class="input-row">
				<n-input v-model:value="parking.color" placeholder="Barva" />
			</div>
			<div class="input-row">
				<n-input v-model:value="parking.spz" placeholder="SPZ" />
			</div>
			<n-button @click="addMe">
				{{
					Object.values(parking).every((item) => item)
						? "Zúčastním se s parkováním"
						: "Zúčastním se bez parkování"
				}}
			</n-button>
		</n-modal>
	</section>
</template>

<script setup lang="ts">
import {NButton, NInput, NModal, NTooltip} from "naive-ui";
import {EAttendance, type IParking, type ISoldier} from "~/types";

const
	logged = useState<ISoldier>("logged"),
	myId = logged.value.personalNumber,
	{id} = useRoute().params as unknown as {id: string;},
	showParkingModal = ref(false),
	parking: Ref<IParking> = ref({color: "", spz: "", brand: ""}),
	drill = (await getDrills({id}))[0],
	nominations = ref(await getDrillNominations(id)),
	present = computed(() =>
		nominations.value.filter(
			(nomination) => nomination.status === EAttendance.Present
		)
	),
	absent = computed(() =>
		nominations.value.filter(
			(nomination) => nomination.status === EAttendance.Absent
		)
	),
	notResponded = computed(() =>
		nominations.value.filter(
			(nomination) => nomination.status === EAttendance.NotResponded
		)
	),
	nominated = ref(
		nominations.value.map((nomination) => nomination.soldier.personalNumber)
	),
	alreadyAbsent = computed(() =>
		absent.value.some(
			(nomination) => nomination.soldier.personalNumber === myId
		)
	),
	alreadyIn = computed(() =>
		present.value.some(
			(nomination) => nomination.soldier.personalNumber === myId
		)
	);

async function callRemoveDrill() {
	await removeDrill(drill.value.id);
	useRouter().replace("/drills");
}

async function addMe() {
	const parkingNom = Object.values(parking.value).every((item) => item)
		? parking.value
		: undefined;
	nominations.value = await reactToNomination(
		id,
		EAttendance.Present,
		parkingNom
	);
	showParkingModal.value = false;
	parking.value = {color: "", spz: "", brand: ""};
}

async function removeMe() {
	nominations.value = await reactToNomination(id, EAttendance.Absent);
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
