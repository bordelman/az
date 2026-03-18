<template>
	<div class="p-4 border rounded shadow-sm">
		<h3 class="mb-4">Import vojáků</h3>

		<input type="file" accept=".csv" @change="handleFileUpload" :disabled="isProcessing"
			class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />

		<div v-if="isProcessing" class="mt-4 text-blue-600">
			Zpracovávám soubor...
		</div>

		<div v-if="soldiers.length > 0" class="mt-6">
			<p class="text-green-600 font-bold">Nalezeno {{ soldiers.length }} záznamů</p>

			<button @click="sendToBackend" class="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
				Odeslat na server
			</button>

			<details class="mt-4">
				<summary class="cursor-pointer text-blue-500 underline">Zobrazit náhled dat</summary>
				<pre class="bg-gray-100 p-2 mt-2 text-xs overflow-auto max-h-60">{{ soldiers.slice(0, 5) }}</pre>
			</details>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Papa from 'papaparse';

const HeadersMap: Record<string, string> = {
	'KČÚ': 'UCN',
	'Pozice': 'positionId',
	'Osobní číslo': 'personalNumber',
	'Hodnost': 'rankId',
	'Titul před': 'titleBefore',
	'Jméno': 'firstname',
	'Příjmení': 'lastname',
	'Titul za': 'titleAfter',
	'Telefon': 'phone',
	'Mobil': 'mobile',
	'E-mail': 'email',
	'Datová schránka': 'dataBox'
},
	{ ranks } = useSettings(),
	soldiers = ref<any[]>([]),
	positions = ref<Record<number, string>>({}),
	isProcessing = ref(false);

const handleFileUpload = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;

	isProcessing.value = true;
	positions.value = {};

	const reader = new FileReader();

	reader.onload = (e) => {
		const content = e.target?.result as string;

		Papa.parse(content, {
			header: true,
			delimiter: ";",
			skipEmptyLines: true,
			transformHeader: (header) => {
				const clean = header.trim();
				return HeadersMap[clean] || clean;
			},
			complete: (results) => {
				soldiers.value = results.data.map((row: any) => processRow(row));
				isProcessing.value = false;
				console.log("Parsování hotovo", soldiers.value);
			}
		});
	};

	// Na FE řešíme kódování přímo v readeru
	reader.readAsText(file, 'utf-8');
};

const processRow = (row: any) => {
	const processed: any = {};
	for (const [key, value] of Object.entries(row)) {
		const val = String(value).trim();

		if (key === HeadersMap["KČÚ"] || key === HeadersMap["Osobní číslo"]) {
			processed[key] = parseInt(val, 10) || null;
		}
		else if (key === 'positionId') {
			const [id, ...rest] = val.split('-');
			const parsedId = parseInt(id.trim(), 10);
			const label = rest.join('-').trim();

			if (!isNaN(parsedId)) {
				positions.value[parsedId] = label;
				processed[key] = parsedId;
			}
		}
		else if (key === HeadersMap.Hodnost) {
			processed[key] = ranks.value.find(rank => rank.abbreviation === val.replace('.', '').trim()).id
		}
		else {
			processed[key] = val || null;
		}
	}
	return processed;
};

const sendToBackend = async () => {
	const {processed} = await uploadSoldiers(soldiers.value, positions.value);
	if (processed) {
		window.alert("Zpracováno");
		soldiers.value = [];
		positions.value = [];
	}
	else {
		window.alert("Chyba importu")
	}
};
</script>