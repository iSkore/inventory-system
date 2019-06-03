<template>
	<v-app>
		<v-toolbar app>
			<v-toolbar-title class="headline text-uppercase">
				<span>Inventory</span>
				<span class="font-weight-light">System</span>
			</v-toolbar-title>
			
			<v-spacer></v-spacer>
			
			<v-btn
				flat
				href="https://github.com/mi-sec/inventory-system/releases/latest"
				target="_blank"
			>
				<span class="mr-2">Latest Release</span>
			</v-btn>
		</v-toolbar>
		
		<v-content>
			<HelloWorld/>
		</v-content>
	</v-app>
</template>

<script>
	import HelloWorld from './components/HelloWorld';
	
	export default {
		name: 'App',
		components: {
			HelloWorld
		},
		data() {
			return {
				//
			};
		}
	};
</script>
