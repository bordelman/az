<template>
	<div class="p-4 border rounded shadow-sm">
		<h3 class="mb-4">Import stavu bezpečnostních prověrek</h3>

		<input type="file" accept=".csv" @change="handleFileUpload" :disabled="isProcessing"
			class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />

		<div v-if="isProcessing" class="mt-4 text-blue-600">
			Zpracovávám soubor...
		</div>

		<div v-if="clearances.length > 0" class="mt-6">
			<p class="text-green-600 font-bold">Nalezeno {{ clearances.length }} záznamů</p>

			<button @click="sendToBackend" class="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
				Odeslat na server
			</button>

			<details class="mt-4">
				<summary class="cursor-pointer text-blue-500 underline">Zobrazit náhled dat</summary>
				<pre class="bg-gray-100 p-2 mt-2 text-xs overflow-auto max-h-60">{{ clearances.slice(0, 5) }}</pre>
			</details>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Papa from 'papaparse';

const HeadersMap: Record<string, string> = {
	'Kód SM': 'assignmentId',
	'Platnost osvědčení, oznámení, dokladu od - do': 'clearance'
},
	isProcessing = ref(false),
	clearances = ref([]);

const handleFileUpload = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	if (!file) return;

	isProcessing.value = true;

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
				clearances.value = results.data.map((row: any) => processRow(row)).filter((row: any) => row.clearance);
				isProcessing.value = false;
			}
		});
	};
	reader.readAsText(file, 'utf-8');
};

const processRow = (row: any) => {
	const processed: any = {};
	for (const [key, value] of Object.entries(row)) {
		const val = String(value).trim();

		if (key === HeadersMap["Kód SM"]) {
			processed[key] = parseInt(val, 10) || null;
		}
		else {
			const due = val.split("\n")[1];
			if (due) {
				const [day, month, year] = due.split(".");

				processed[key] = val ? new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day)) : null;
			}
		}
	}
	return processed;
};

const sendToBackend = async () => {
	const { processed } = await uploadSoldiersClearances(clearances.value);
	if (processed) {
		window.alert("Zpracováno");
		clearances.value = [];
	}
	else {
		window.alert("Chyba importu")
	}
};
</script>