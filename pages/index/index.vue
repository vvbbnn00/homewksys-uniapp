<template>
	<view class="content">
		<!-- #ifdef APP-PLUS -->
		<uni-notice-bar @getmore="get_latest_version()" :showGetMore="true" moreText="立刻更新" v-if="notice!==''" scrollable="true"
		 showClose="true" showIcon="true" :text="notice"></uni-notice-bar>
		<!-- #endif -->
		<uni-card class="index_card" title="总览" mode="basic" icon="circle-filled" :is-shadow="true" extra="您的总体完成情况" note="El Psy Congroo.">
			<div>-您当前需要完成的任务</div>
			<center class="task_title"> {{task_name}} </center>
			<div :style="'color:' + task_color + ';'">-您的总体进度：{{task_progress}}</div>
			<div>-距离开学还有：</div>
			<uni-countdown :second="remains"></uni-countdown>
		</uni-card>

		<uni-card class="index_card" title="本周任务清单" icon="chatbubble" mode="basic" :is-shadow="true">
			<view class="todo-list">
				<table class="pure-table">
					<tr v-for="item in thisweek">
						<td>
							<view class="task-name" style="width: 120rpx;">
								<uni-tag :text="item.accomplished === 'true' ? '达成' : '未达成'" :type="item.accomplished === 'true' ? 'success' : 'error'"
								 :circle="true"></uni-tag>
							</view>
						</td>
						<td>
							<view class="task-name" style="width: 200rpx;">{{item.title}}</view>
						</td>
						<td>
							<view class="task-name" style="width: 100rpx;">{{item.now}}/{{item.exp}}</view>
						</td>
						<td>
							<view class="task-name" style="width: 120rpx;">
								<uni-tag :text="item.accomplished === 'true' ? '查看' : '去完成'" :type="item.accomplished === 'true' ? 'primary' : 'warning'"
								 :circle="false" @click="go_detail(item.tid)"></uni-tag>
							</view>
						</td>
					</tr>
				</table>
			</view>

		</uni-card>

		<uni-card v-for="index in notice_data['length']" class="index_card" :title="notice_data[(index-1).toString()]['title']"
		 icon="chatbubble" mode="basic" :is-shadow="true" :note="notice_data[(index-1).toString()]['date']" @click="open_url(notice_data[(index-1).toString()]['url'])">
			<rich-text :nodes="notice_data[(index-1).toString()]['msg']"></rich-text>
		</uni-card>

		<uni-card class="index_card" title="一言" icon="paperplane" mode="basic" :is-shadow="true" :note="one_from">
			{{one_sentence}}
			<view class="refresh"><uni-tag class="refresh-button" text="刷新" type="default" :circle="true" @click="get_one()"></uni-tag></view>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data: function() {
			return {
				task_name: '加载中',
				task_progress: "0%",
				update_time: "正在加载",
				notice: "正在加载",
				one_sentence: "加载中",
				one_from: "加载中",
				task_color: "",
				remains: 0,
				notice_data: [],
				thisweek: [],
				notice: ""
			}
		},
		onShow() {
			this.task_progress = uni.getStorageSync('total_progress') + "%"
			if (uni.getStorageSync('ini_update')) this.init();
			// console.log(uni.getStorageSync('ini_update'))
		},
		onLoad() {
			this.init();
			this.get_one();
			// #ifdef APP-PLUS
			this.get_latest_version();
			// #endif
		},
		methods: {
			async get_latest_version() {
				let {
					data: result
				} = await this.$ajax({
					url: "hwk/version.json"
				})
				let content = "新版本：" + result.version + "\n新版特性:\n"
				for (let item in result.log) {
					content += "- " + (result.log[item]) + "\n"
				}
				content += "点击【确定】以跳转至页面更新"
				if (plus.runtime.version !== result.version) {
					this.notice = "[更新提醒]有新版本发布，为了保证软件能够正常使用，请及时更新。"
					uni.showModal({
						title: "有新版本可以更新",
						content: content,
						success: (res) => {
							if (res.confirm) {
								this.open_url(result.url)
							}
						}
					})
				}
			},
			go_detail(tid) {
				uni.setStorageSync('now_tid', tid);
				uni.navigateTo({
					url: "../tasks/detail/detail"
				})
			},
			async this_week() {
				let {
					data: week_data
				} = await this.$ajax({
					url: "hwk/today",
					data: {
						token: uni.getStorageSync('token')
					}
				})
				// console.log(week_data['list'])
				this.thisweek = week_data['list']
			},
			init() {
				this.this_week()
				uni.preloadPage({
					url: "/pages/tasks/tasks"
				});
				if (uni.getStorageSync('token') == "") {
					uni.showModal({
						title: '提示',
						content: '您尚未登录，请登录后使用',
						showCancel: false,
						success: function(res) {
							if (res.confirm) {
								uni.redirectTo({
									url: "../settings/login/login"
								})
							}
						}
					});
					return
				}
				this.get_info();
				let that = this;
			},
			open_url(url) {
				if (url === "") return
				uni.showModal({
					title: "提示",
					content: "即将跳转页面至\n" + url,
					success: function(res) {
						if (res.confirm) {
							// #ifdef H5 || MP-WEIXIN || MP-QQ
							console.log("H5");
							window.open(url);
							// #endif
							// #ifdef APP-PLUS
							console.log("APP");
							plus.runtime.openURL(url);
							// #endif
						}
					}
				})
			},

			async get_info() {
				let timestamp = new Date().getTime();
				const token = uni.getStorageSync('token');
				let {
					data: task_data
				} = await this.$ajax({
					url: "hwk/task_info.json"
				})
				this.task_name = task_data.task_name;
				let deadline = Number(task_data.deadline)
				this.remains = Math.round((deadline - timestamp) / 1000);
				let {
					data: notice_data
				} = await this.$ajax({
					url: "hwk/notice"
				})
				let lid = uni.getStorageSync("user_lid")
				this.notice_data = notice_data['notice'].filter(item => {
					if (item.target.indexOf("All")+item.target.indexOf(lid)!==-2) {
						return true;
					}
					return false;
				});
				uni.stopPullDownRefresh();
			},
			async get_one() {
				this.one_from = "加载中"
				this.one_sentence = "加载中"
				let {
					data: result
				} = await this.$ajax({
					url: "https://v1.hitokoto.cn/?c=" + uni.getStorageSync("ini_open_sel").join('&c='),
					local: false
				})
				this.one_from = result.from.toString();
				this.one_sentence = result.hitokoto.toString();
			}
		},
		onPullDownRefresh() {
			this.get_info();
		}
	}
</script>

<style>
	.refresh {
		display: inline-block;
	}
	.refresh-button{
		border: 1rpx solid #555555;
	}

	.task-name {
		-o-text-overflow: ellipsis;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
		word-wrap: break-word;
		padding-left: 10rpx;
		padding-right: 10rpx;
	}

	.pure-table {
		border-collapse: collapse;
		border-spacing: 0;
		empty-cells: show;
		table-layout: fixed;
		word-break: break-all;
		word-wrap: break-word;
	}

	.todo-list {
		display: flex;
	}

	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.task_title {
		margin-top: 20rpx;
		margin-bottom: 20rpx;
		font-size: 36rpx;
		color: #1e272e;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}

	.index_card {
		width: 90%;
	}
</style>
