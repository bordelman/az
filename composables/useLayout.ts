const
	processCount = ref(1),
	isLoading = ref(true);

export function useLayout() {
	
	return {
		isLoading,
		loadingEnd: () => {
			processCount.value --;
			if (!processCount.value) {
				setTimeout(() => isLoading.value = false, 50)
			}
		},
		loadingStart: () => {
			processCount.value ++;
			isLoading.value = true
		},
		processCount
	}
}
