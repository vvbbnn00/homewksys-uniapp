<template>
	<view class="content">
		<uni-notice-bar v-if="under_dev" text="当前处于测试环境"></uni-notice-bar>
		<!-- #ifdef APP-PLUS -->
		<uni-notice-bar @getmore="get_latest_version()" :showGetMore="true" moreText="立刻更新" v-if="notice!==''" scrollable="true"
		 showClose="true" showIcon="true" :text="notice"></uni-notice-bar>
		<!-- #endif -->
		<uni-card class="index_card" title="总览" mode="basic" icon="circle-filled" :is-shadow="true" extra="您的总体完成情况" note="El Psy Congroo.">
			<center class="task_title"> <b>{{task_name}}</b></center>
			<view>- 您的总体进度：<text :style="'color:' + task_color + ';'"><b>{{task_progress}}</b></text>
				<uni-icons type="refresh-filled" size="20" @click="load_tasks()"></uni-icons>
			</view>
			<div>- 距离开学还有：</div>
			<center>
				<uni-countdown :second="remains" class="countdown"></uni-countdown>
			</center>
		</uni-card>

		<uni-card v-if="show_everyweek" class="index_card" title="任务清单(点击左侧Tag查看详情)" icon="chatbubble" mode="basic"
		 :is-shadow="true">
			<view class="todo-list">
				<table class="pure-table">
					<tr v-for="item in thisweek">
						<td width="20%">
							<view class="task-name">
								<uni-tag :text="item.accomplished === 'true' ? '达成' : calc_day(item.deadline).tag" :type="item.accomplished === 'true' ? 'success' : calc_day(item.deadline).color"
								 :circle="true" @click="get_detail(item.title, item.deadline, item.detail, item.accomplished)"></uni-tag>
							</view>
						</td>
						<td width="40%">
							<view class="task-name">{{item.title}}</view>
						</td>
						<td width="20%">
							<view class="task-name">{{item.now}}/{{item.exp}}</view>
						</td>
						<td width="20%">
							<view class="task-name">
								<uni-tag :text="item.accomplished === 'true' ? '查看' : '去完成'" :type="item.accomplished === 'true' ? 'primary' : 'warning'"
								 :circle="false" @click="go_detail(item.tid)"></uni-tag>
							</view>
						</td>
					</tr>
				</table>
			</view>

		</uni-card>

		<uni-card v-if="show_notice" v-for="index in notice_data['length']" class="index_card" :title="notice_data[(index-1).toString()]['title']"
		 icon="chatbubble" mode="basic" :is-shadow="true" :note="notice_data[(index-1).toString()]['date']" @click="open_url(notice_data[(index-1).toString()]['url'])">
			<rich-text :nodes="notice_data[(index-1).toString()]['msg']"></rich-text>
		</uni-card>

		<uni-card v-if="show_one" class="index_card" title="一言" icon="paperplane" mode="basic" :is-shadow="true" :note="one_from">
			{{one_sentence}}
			<view class="refresh">
				<uni-tag class="refresh-button" text="刷新" type="default" :circle="true" @click="get_one()"></uni-tag>
			</view>
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
				notice: "",
				show_everyweek: true,
				show_notice: true,
				show_one: true,
				under_dev: false,
			}
		},
		onShow() {
			uni.preloadPage({
				url: "../tasks/tasks"
			})
			this.task_progress = uni.getStorageSync('total_progress') + "%"
			this.task_color = "#fb3848"
			if (uni.getStorageSync('total_progress') >= 30) this.task_color = "#ff6030"
			if (uni.getStorageSync('total_progress') >= 55) this.task_color = "#ffc74f"
			if (uni.getStorageSync('total_progress') >= 85) this.task_color = "#19ff37"

			if (uni.getStorageSync('ini_everyweek') === "") uni.setStorageSync('ini_everyweek', true)
			if (uni.getStorageSync('ini_open_one') === "") uni.setStorageSync('ini_open_one', true)
			if (uni.getStorageSync('ini_notice') === "") uni.setStorageSync('ini_notice', true)
			if (uni.getStorageSync('is_dev_mode') === "") uni.setStorageSync('is_dev_mode', false)

			this.under_dev = uni.getStorageSync('is_dev_mode')
			this.show_one = uni.getStorageSync('ini_open_one')
			this.show_everyweek = uni.getStorageSync('ini_everyweek')
			this.show_notice = uni.getStorageSync('ini_notice')

			if (uni.getStorageSync('ini_update')) this.init();
			// console.log(uni.getStorageSync('ini_update'))
		},
		onLoad() {
			this.get_one();
			this.init();
			// #ifdef APP-PLUS
			this.get_latest_version();
			// #endif
			// if ((uni.getStorageSync("token") !== "") && (uni.getStorageSync("Update-v0.2") !== "OK")) {
			// 	uni.showModal({
			// 		title: "提示",
			// 		content: "由于该更新是大版本更新，可能会遇到数据显示错误的现象，按确定以同步。",
			// 		showCancel: false,
			// 		success: (res) => {
			// 			if (res.confirm) {
			// 				uni.switchTab({
			// 					url: "../settings/settings"
			// 				})
			// 				uni.setStorageSync("Update-v0.2", "OK")
			// 			}
			// 		}
			// 	})
			// }
		},
		methods: {
			async load_tasks() {
				this.task_progress = "加载中"
				this.token = uni.getStorageSync('token')
				let {
					data: result
				} = await this.$ajax({
					url: "hwk/get_list?token=" + this.token,
					noloading: true
				})
				if (result.code === 400) {
					uni.showModal({
						title: "提示",
						content: "您尚未设置选科，请在[设置-任务设置-切换您的选科]中设置。",
						showCancel: false
					})
					return
				}
				this.json_data = result;
				let {
					data: result2
				} = await this.$ajax({
					url: "hwk/get_save?token=" + this.token,
					noloading: true
				})
				this.user_data = JSON.parse(result2['save']);
				this.subjects = [];
				let total_total = 0;
				let total_now = 0;
				for (let i = 0; i < this.json_data['subjects']['length']; i++) {
					let data = this.json_data['subjects'][i.toString()]['tasks']
					let total = 0;
					let now = 0;
					for (let j = 0; j < data['length']; j++) {
						let progress = this.user_data[data[j.toString()]['uni_tid']]
						if (progress === undefined) {
							progress = '0';
						}
						if (data[j.toString()]['type'] !== "notification") {
							now += Number(progress)
							total += Number(data[j.toString()]['total'])
						}
					}
					total_total += total;
					total_now += now;
				}
				uni.setStorageSync('total_progress', Math.round((total_now / total_total) * 100))
				this.task_progress = Math.round((total_now / total_total) * 100).toString() + "%"
				const db = uniCloud.database();
				db.collection("hwk_ranklist").where({
					"email": uni.getStorageSync("usr_email")
				}).update({
					email: uni.getStorageSync("usr_email"),
					progress: this.task_progress
				})
			},
			formatDate(date) {
				var date = new Date(date * 1000);
				var YY = date.getFullYear() + '-';
				var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
				var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
				var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
				var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
				var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
				return YY + MM + DD + " " + hh + mm + ss;
			},
			get_detail(title, deadline, detail, completed) {
				uni.showModal({
					title: "任务详情",
					content: "任务标题：" + title + "\n任务详情：" + (detail === "" ? "详见任务详情页面" : detail) + "\n交付日期：" + this.formatDate(
						deadline) + "\n当前状态：" + (completed === "true" ? "达标" : "未达标"),
					showCancel: false,
				})
			},
			calc_day(timestamp_target) {
				let now = Math.floor(new Date().getTime() / 1000)
				let remains = timestamp_target - now
				if (remains < 0) {
					return {
						tag: "超时",
						color: "error"
					}
				}
				let [day, hour, minute, second] = [0, 0, 0, 0]
				if (remains > 0) {
					day = Math.floor(remains / (60 * 60 * 24))
					hour = Math.floor(remains / (60 * 60)) - (day * 24)
					minute = Math.floor(remains / 60) - (day * 24 * 60) - (hour * 60)
					second = Math.floor(remains) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60)
				}
				if (day > 0) {
					if (day >= 15) {
						return {
							tag: day.toString() + "天",
							color: "primary"
						}
					}
					if (day >= 7) {
						return {
							tag: day.toString() + "天",
							color: "warning"
						}
					} else {
						return {
							tag: day.toString() + "天",
							color: "error"
						}
					}
				}
				if (hour > 0) {
					return {
						tag: hour.toString() + "时",
						color: "error"
					}
				}
				if (minute > 0) {
					return {
						tag: minute.toString() + "分",
						color: "error"
					}
				}
				if (second > 0) {
					return {
						tag: second.toString() + "秒",
						color: "error"
					}
				}
			},
			async get_latest_version() {
				let {
					data: result
				} = await this.$ajax({
					url: "hwk/version.json",
					noloading: true
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
					},
					noloading: true
				})
				// console.log(week_data['list'])
				let todo = week_data['list'].filter(item => {
					if (item.accomplished === "true") return false
					return true;
				});
				let done = week_data['list'].filter(item => {
					if (item.accomplished === "true") return true
					return false;
				});
				let now = Math.floor(new Date().getTime() / 1000)
				todo.sort((i1, i2) => {
					if (i1.deadline - now > i2.deadline - now) return 1
					return -1
				})
				this.thisweek = todo.concat(done)
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
					url: "hwk/task_info.json",
					noloading: true
				})
				this.task_name = task_data.task_name;
				let deadline = Number(task_data.deadline)
				this.remains = Math.round((deadline - timestamp) / 1000);
				let {
					data: notice_data
				} = await this.$ajax({
					url: "hwk/notice",
					noloading: true
				})
				let lid = uni.getStorageSync("user_lid")
				this.notice_data = notice_data['notice'].filter(item => {
					if (item.target.indexOf("All") + item.target.indexOf(lid) !== -2) {
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
					local: false,
					noloading: true
				})
				this.one_from = result.from.toString();
				this.one_sentence = result.hitokoto.toString();
			}
		},
		async onPullDownRefresh() {
			await this.get_info();
		}
	}
</script>

<style>
	.refresh {
		display: inline-block;
	}

	.refresh-button {
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
		width: 100%;
		border-collapse: collapse;
		border-spacing: 0;
		empty-cells: show;
		table-layout: fixed;
		word-break: break-all;
		word-wrap: break-word;
	}

	.todo-list {
		display: flex;
		width: 100%;
	}

	.content {
		max-width: 550px;
		box-shadow: 0px 0px 10px #888888;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		margin: auto;
	}

	.task_title {
		margin-top: 5rpx;
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

	.countdown {
		/* #ifdef H5 */
		display: inline-flex;		
		/* #endif */
		/* #ifdef APP-PLUS */
		width: 35%;
		/* #endif */
		font-size: 30rpx;
		font-weight: bold;
	}
</style>
