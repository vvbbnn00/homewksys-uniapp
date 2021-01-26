<template>
	<view>
		<uni-card class="index_card" title="网课下载" mode="basic" icon="circle-filled"
		:is-shadow="true" extra="共同进步!" note="El Psy Congroo">
			<center> <h2>{{status}}</h2></center>
		</uni-card>
		<uni-list>
			<uni-list-item  v-for="item in list" :title="item.title" 
			:note="'上传时间:' + item.date + '  科目:'+item.subject" rightText="下载" clickable @click="open_url(item.url)"></uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[],
				status: "加载中..."
			}
		},
		onLoad(){
			this.get_list()
		},
		methods: {
			open_url(url) {
				if (url === "") return
				uni.showModal({
					title: "提示",
					content: "即将打开页面：\n" + url,
					success: function(res) {
						if (res.confirm) {
							// #ifdef H5 || MP-WEIXIN || MP-QQ
							window.open(url);
							// #endif
							// #ifdef APP-PLUS
							plus.runtime.openURL(url);
							// #endif
						}
					}
				})
			},
			async get_list(){
				this.status = "加载中..."
				const db = uniCloud.database();
				let data = await db.collection("net_courses").orderBy("timestamp","desc").get()
				data = data.result.data
				this.list = data
				this.status = "点击下方列表即可下载"
			}
		},
		async onPullDownRefresh() {
			await this.get_list()
			uni.stopPullDownRefresh()
		}
	}
</script>

<style>

</style>
