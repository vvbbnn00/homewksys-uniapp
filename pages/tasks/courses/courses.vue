<template>
	<view class="content">
		<uni-card class="index_card" title="网课下载" mode="basic" icon="circle-filled" :is-shadow="true" extra="共同进步!" note="El Psy Congroo">
			<center>
				<rich-text :nodes="status"></rich-text>
			</center>
		</uni-card>
		<!-- <uni-list-item to="play/play"></uni-list-item> -->
		<uni-section title="下载" type="line"></uni-section>
		<uni-list>
			<uni-list-item v-for="item in list" :title="item.title" :note="'上传时间:' + item.date + '\n科目:'+item.subject" rightText="下载"
			 clickable @click="open_url(item.url)"></uni-list-item>
		</uni-list>

		<uni-section title="在线观看" type="line"></uni-section>
		<uni-list>
			<uni-list-item v-for="item in play_list" :title="item.title" :note="formatDate(item.timestamp) + '\nVID:' + item._id"
			 rightText="播放" clickable @click="play_vid(item._id)"></uni-list-item>
		</uni-list>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				play_list: [],
				list: [],
				status: "加载中..."
			}
		},
		onLoad() {
			this.get_list()
		},
		methods: {
			formatDate(datetime) {
				var date = new Date(datetime); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
				var year = date.getFullYear(),
					month = ("0" + (date.getMonth() + 1)).slice(-2),
					sdate = ("0" + date.getDate()).slice(-2),
					hour = ("0" + date.getHours()).slice(-2),
					minute = ("0" + date.getMinutes()).slice(-2),
					second = ("0" + date.getSeconds()).slice(-2);
				// 拼接
				var result = year + "-" + month + "-" + sdate + " " + hour + ":" + minute + ":" + second;
				// 返回
				return result;
			},
			play_vid(vid){
				uni.setStorageSync("watch_vid", vid)
				uni.navigateTo({
					url:"play/play"
				})
			},
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
			async get_list() {
				this.status = "加载中..."
				const db = uniCloud.database();
				let data = await db.collection("net_courses").orderBy("timestamp", "desc").get()
				this.list = data.result.data
				data = await db.collection("hwk_vid_info").orderBy("timestamp", "desc").get()
				this.play_list = data.result.data
				this.status = "<h3>	现在，你可以选择<strong>下载录播或在线观看啦（在线看还能发弹幕）</strong></h3><p>	PS:由于服务器限制上传文件大小和其他各种原因，实现这个播放器花了我整整<strong>两</strong><strong>天时间</strong>（虽然还是有非常非常多的bug，啊对了，<strong><u>千万不要调戏进度条</u></strong>）。</p>"
			}
		},
		async onPullDownRefresh() {
			await this.get_list()
			uni.stopPullDownRefresh()
		}
	}
</script>

<style>
	.content {
		max-width: 550px;
		margin: auto;
		box-shadow: 0px 0px 10px #888888;
		padding-top: 20rpx;
	}
</style>
