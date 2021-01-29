<template>
	<view>
		<uni-list-item title="读取数据库" @click="readdb()" clickable></uni-list-item>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {
			async readdb() {
				// const db = uniCloud.database();
				// let collection = db.collection("user_log");
				// let result =await collection.add({
				// 	email: "test@test.com",
				// 	timestamp: (new Date()).getTime(),
				// 	content: "content",
				// })
				// console.log(result)
			}
		}
	}
</script>

<style>

</style>
