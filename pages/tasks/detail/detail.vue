<template>
	<view class="content">
		<uni-card :title="title" mode="title" :is-shadow="true" :thumbnail="pic" :extra="'任务ID:'+tid" :note="type">
			<div class="progress progress--active" v-if="type!=='通知'">
				<b :class="bar_style" :style="'width:'+progress+'%;'">
					<span class="progress__text">
						总体进度：<em>{{progress}}%</em>
					</span>
				</b>
			</div>
		</uni-card>
		<uni-card title="任务详情">
			<rich-text :nodes="detail"></rich-text>
		</uni-card>
		<uni-card title="附件" v-if="files['length'] !== 0">
			<uni-list>
				<uni-list-item v-for="index in files['length']" rightText='下载' :title="files[(index-1).toString()]['name']"
				 clickable @click="open_url(files[(index-1).toString()]['url'])"></uni-list-item>
			</uni-list>
		</uni-card>
		<uni-card title="控制面板" v-if="type!=='通知'">
			<text>
				<center class="info">当前完成了<b>{{now}}</b>,总共<b>{{total}}</b>.</center>
			</text>

			<view class="panel">
				<view class="small"><button type="primary" @click="change(-1)" :disabled="loading" :loading="loading">-1</button></view>
				<view class="small"><button type="primary" @click="change(1)" :disabled="loading" :loading="loading">+1</button></view>
			</view>
			<button class="big" type="warn" @click="change(9999999)" :disabled="loading" :loading="loading">全部点满！</button>
			<button class="big" type="warn" @click="change(-9999999)" :disabled="loading" :loading="loading">全部清零？</button>
		</uni-card>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tid: "加载中",
				title: "加载中",
				type: "加载中",
				bar_style: "progress__bar",
				progress: 0,
				detail: "加载中",
				files: [],
				pic: "",
				total: 0,
				now: 0,
				loading: false,
			}
		},
		onShow() {
			this.tid = uni.getStorageSync('now_tid');
			this.get_info()
		},
		methods: {
			async change(value) {
				this.loading = true;
				this.now += value;
				if (this.now > this.total) this.now = this.total
				if (this.now < 0) this.now = 0
				let {
					data: result
				} = this.$ajax({
					url: "hwk/set_save",
					data: {
						uni_tid: this.tid,
						value: this.now,
						token: uni.getStorageSync('token')
					},
					noloading: true,
				})
				this.loading = false;
				this.progress = Math.round((this.now / this.total) * 100)
				this.bar_style = "progress__bar "
				if (this.progress >= 30) this.bar_style += "progress__bar--orange "
				if (this.progress >= 55) this.bar_style += "progress__bar--yellow "
				if (this.progress >= 85) this.bar_style += "progress__bar--green "
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
				let {
					data: task_info
				} = await this.$ajax({
					url: 'hwk/task_info',
					data: {
						uni_tid: this.tid,
					}
				})
				if (task_info.code !== 200) {
					uni.showModal({
						title: "错误",
						content: "加载任务失败",
						showCancel: false,
					})
				}
				this.type = task_info.type === "task" ? "普通任务" : "通知";
				this.title = task_info.title;
				this.detail = task_info.details;
				this.files = task_info.files;
				let {
					data: save_info
				} = await this.$ajax({
					url: 'hwk/get_save',
					data: {
						token: uni.getStorageSync('token'),
					}
				})
				this.now = Number(JSON.parse(save_info['save'])[this.tid] ? JSON.parse(save_info['save'])[this.tid] : 0)
				this.total = task_info.total
				this.pic = task_info.type === "task" ? this.now === this.total ? "../../../static/images/finished.png" :
					"../../../static/images/unfinished.png" : "../../../static/images/notice.png";
				this.progress = Math.round((this.now / this.total) * 100)
				this.bar_style = "progress__bar "
				if (this.progress >= 30) this.bar_style += "progress__bar--orange "
				if (this.progress >= 55) this.bar_style += "progress__bar--yellow "
				if (this.progress >= 85) this.bar_style += "progress__bar--green "
				uni.stopPullDownRefresh()
			},
			async onPullDownRefresh() {
				await this.get_info()
			}
		}
	}
</script>

<style>
	
	.content {
		padding-top: 20rpx;
		padding-bottom: 20rpx;
		max-width: 550px;
		margin: auto;
		box-shadow: 0px 0px 10px #888888;
	}
	
	.panel {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
	}

	.info {
		font-size: 36rpx;
	}

	.small {
		width: 40%;
		margin: 15rpx;
		margin-left: 5%;
		margin-right: 5%;
	}


	.big {
		margin: 15rpx;
		margin-left: 5%;
		margin-right: 5%;

	}

	.progress {
		font-size: 1.2em;
		height: 20px;
		background: #d2dae2;
		border-radius: 2px;
		border: 1px solid #a3b5c5;
		margin-top: 20rpx;
		margin-bottom: 20rpx;
	}

	.progress--active .progress__bar {
		opacity: 1;
	}

	.progress__text {
		width: 20em;
		padding: 0 0.9em;
		position: absolute;
	}

	.progress__text em {
		font-style: normal;
	}

	.progress__bar {
		color: white;
		font-size: 12px;
		font-weight: normal;
		text-shadow: 0 1px 1px rgba(0, 0, 0, 0.6);
		line-height: 19px;
		display: block;
		position: relative;
		top: -1px;
		left: -1px;
		width: 0%;
		height: 100%;
		opacity: 0;
		border: 1px solid;
		border-radius: 2px 0 0 2px;
		background-size: 100px 30px, 130px 30px, 130px 30px;
		background-position: -20% center, right center, left center;
		background-repeat: no-repeat, no-repeat, no-repeat;
		-webkit-transition: opacity 0.2s ease, width 0.8s ease-out, background-color 1s ease, border-color 0.3s ease, box-shadow 1s ease;
		transition: opacity 0.2s ease, width 0.8s ease-out, background-color 1s ease, border-color 0.3s ease, box-shadow 1s ease;
		-webkit-animation: pulse 2s ease-out infinite;
		animation: pulse 2s ease-out infinite;
		background-color: rgba(201, 4, 20, 0.95);
		background-image: -webkit-linear-gradient(0deg, rgba(226, 4, 22, 0) 10%, rgba(250, 6, 26, 0.8) 30%, #fb1f31 70%, rgba(250, 6, 26, 0.8) 80%, rgba(226, 4, 22, 0) 90%), -webkit-linear-gradient(left, rgba(251, 31, 49, 0) 0%, #fb1f31 100%), -webkit-linear-gradient(right, rgba(251, 31, 49, 0) 0%, #fb1f31 100%);
		background-image: linear-gradient(90deg, rgba(226, 4, 22, 0) 10%, rgba(250, 6, 26, 0.8) 30%, #fb1f31 70%, rgba(250, 6, 26, 0.8) 80%, rgba(226, 4, 22, 0) 90%), linear-gradient(to right, rgba(251, 31, 49, 0) 0%, #fb1f31 100%), linear-gradient(to left, rgba(251, 31, 49, 0) 0%, #fb1f31 100%);
		border-color: #fb3848;
		box-shadow: 0 0 0.6em #fa061a inset, 0 0 0.4em #e20416 inset, 0 0 0.5em rgba(201, 4, 20, 0.5), 0 0 0.1em rgba(254, 206, 210, 0.5);
	}

	.progress__bar--orange {
		background-color: rgba(201, 47, 0, 0.95);
		background-image: -webkit-linear-gradient(0deg, rgba(227, 53, 0, 0) 10%, rgba(252, 59, 0, 0.8) 30%, #ff4d17 70%, rgba(252, 59, 0, 0.8) 80%, rgba(227, 53, 0, 0) 90%), -webkit-linear-gradient(left, rgba(255, 77, 23, 0) 0%, #ff4d17 100%), -webkit-linear-gradient(right, rgba(255, 77, 23, 0) 0%, #ff4d17 100%);
		background-image: linear-gradient(90deg, rgba(227, 53, 0, 0) 10%, rgba(252, 59, 0, 0.8) 30%, #ff4d17 70%, rgba(252, 59, 0, 0.8) 80%, rgba(227, 53, 0, 0) 90%), linear-gradient(to right, rgba(255, 77, 23, 0) 0%, #ff4d17 100%), linear-gradient(to left, rgba(255, 77, 23, 0) 0%, #ff4d17 100%);
		border-color: #ff6030;
		box-shadow: 0 0 0.6em #fc3b00 inset, 0 0 0.4em #e33500 inset, 0 0 0.5em rgba(201, 47, 0, 0.5), 0 0 0.1em rgba(255, 214, 201, 0.5);
	}

	.progress__bar--yellow {
		background-color: rgba(232, 158, 0, 0.95);
		background-image: -webkit-linear-gradient(0deg, rgba(255, 174, 2, 0) 10%, rgba(255, 183, 28, 0.8) 30%, #ffbf36 70%, rgba(255, 183, 28, 0.8) 80%, rgba(255, 174, 2, 0) 90%), -webkit-linear-gradient(left, rgba(255, 191, 54, 0) 0%, #ffbf36 100%), -webkit-linear-gradient(right, rgba(255, 191, 54, 0) 0%, #ffbf36 100%);
		background-image: linear-gradient(90deg, rgba(255, 174, 2, 0) 10%, rgba(255, 183, 28, 0.8) 30%, #ffbf36 70%, rgba(255, 183, 28, 0.8) 80%, rgba(255, 174, 2, 0) 90%), linear-gradient(to right, rgba(255, 191, 54, 0) 0%, #ffbf36 100%), linear-gradient(to left, rgba(255, 191, 54, 0) 0%, #ffbf36 100%);
		border-color: #ffc74f;
		box-shadow: 0 0 0.6em #ffb71c inset, 0 0 0.4em #ffae02 inset, 0 0 0.5em rgba(232, 158, 0, 0.5), 0 0 0.1em rgba(255, 248, 232, 0.5);
	}

	.progress__bar--green {
		background-color: rgba(0, 178, 23, 0.95);
		background-image: -webkit-linear-gradient(0deg, rgba(0, 203, 26, 0) 10%, rgba(0, 229, 30, 0.8) 30%, #00fe21 70%, rgba(0, 229, 30, 0.8) 80%, rgba(0, 203, 26, 0) 90%), -webkit-linear-gradient(left, rgba(0, 254, 33, 0) 0%, #00fe21 100%), -webkit-linear-gradient(right, rgba(0, 254, 33, 0) 0%, #00fe21 100%);
		background-image: linear-gradient(90deg, rgba(0, 203, 26, 0) 10%, rgba(0, 229, 30, 0.8) 30%, #00fe21 70%, rgba(0, 229, 30, 0.8) 80%, rgba(0, 203, 26, 0) 90%), linear-gradient(to right, rgba(0, 254, 33, 0) 0%, #00fe21 100%), linear-gradient(to left, rgba(0, 254, 33, 0) 0%, #00fe21 100%);
		border-color: #19ff37;
		box-shadow: 0 0 0.6em #00e51e inset, 0 0 0.4em #00cb1a inset, 0 0 0.5em rgba(0, 178, 23, 0.5), 0 0 0.1em rgba(178, 255, 188, 0.5);
	}

	.progress__bar--blue {
		background-color: rgba(18, 135, 204, 0.95);
		background-image: -webkit-linear-gradient(0deg, rgba(20, 151, 227, 0) 10%, rgba(37, 162, 236, 0.8) 30%, #3dacee 70%, rgba(37, 162, 236, 0.8) 80%, rgba(20, 151, 227, 0) 90%), -webkit-linear-gradient(left, rgba(61, 172, 238, 0) 0%, #3dacee 100%), -webkit-linear-gradient(right, rgba(61, 172, 238, 0) 0%, #3dacee 100%);
		background-image: linear-gradient(90deg, rgba(20, 151, 227, 0) 10%, rgba(37, 162, 236, 0.8) 30%, #3dacee 70%, rgba(37, 162, 236, 0.8) 80%, rgba(20, 151, 227, 0) 90%), linear-gradient(to right, rgba(61, 172, 238, 0) 0%, #3dacee 100%), linear-gradient(to left, rgba(61, 172, 238, 0) 0%, #3dacee 100%);
		border-color: #54b6f0;
		box-shadow: 0 0 0.6em #25a2ec inset, 0 0 0.4em #1497e3 inset, 0 0 0.5em rgba(18, 135, 204, 0.5), 0 0 0.1em rgba(225, 242, 252, 0.5);
	}

	.progress__bar:before,
	.progress__bar:after {
		content: "";
		position: absolute;
		right: -1px;
		top: -10px;
		width: 1px;
		height: 40px;
	}

	.progress__bar:before {
		width: 7px;
		right: -4px;
		background: -webkit-radial-gradient(center, ellipse, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 75%);
		background: radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 75%);
	}

	.progress__bar:after {
		background: -webkit-linear-gradient(top, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 25%, rgba(255, 255, 255, 0.3) 75%, rgba(255, 255, 255, 0) 100%);
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 25%, rgba(255, 255, 255, 0.3) 75%, rgba(255, 255, 255, 0) 100%);
	}

	.progress--complete .progress__bar {
		-webkit-animation: none;
		animation: none;
		border-radius: 2px;
	}

	.progress--complete .progress__bar:after,
	.progress--complete .progress__bar:before {
		opacity: 0;
	}

	@-webkit-keyframes pulse {
		0% {
			background-position: -50% center, right center, left center;
		}

		100% {
			background-position: 150% center, right center, left center;
		}
	}

	@keyframes pulse {
		0% {
			background-position: -50% center, right center, left center;
		}

		100% {
			background-position: 150% center, right center, left center;
		}
	}
</style>
