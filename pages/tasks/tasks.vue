<template>
	<view>
		<!-- 		<uni-search-bar :radius="100" placeholder="快速搜索您的任务" @confirm="search"></uni-search-bar>
 -->
		<uni-notice-bar :text="tips" showClose="true"></uni-notice-bar>
		<uni-card class="index_card" title="任务总览" mode="basic" icon="circle-filled" :is-shadow="true" extra="您的总体完成情况">
			<div class="progress progress--active">
				<b :class="bar_style" :style="'width:'+total_progress+'%;'">
					<span class="progress__text">
						总体进度：<em>{{total_progress}}%</em>
					</span>
				</b>
			</div>
			<div class="progress progress--active" v-for="subject in subjects">
				<b :class="subject.bar_style" :style="'width:'+subject.progress+'%;'">
					<span class="progress__text">
						{{subject.name}}：<em>{{subject.progress}}%</em>
					</span>
				</b>
			</div>
		</uni-card>
		<uni-list-item title="排行榜" to="ranklist/ranklist" link></uni-list-item>
		<uni-list-item title="网课录播" note="物理班的网课" to="courses/courses" link></uni-list-item>
		<div id="task-list">
			<uni-list v-for="subject in subjects">
				<uni-section :title="subject.name" type="line"> </uni-section>
				<uni-list-item v-for="index in subject.tasks['length']" :title="subject.tasks[(index-1).toString()].title" :note="subject.tasks[(index-1).toString()].note"
				 :thumb="subject.tasks[(index-1).toString()].thumb" thumb-size="md" :rightText="subject.tasks[(index-1).toString()].rightText"
				 clickable link @click="go_detail(subject.tasks[(index-1).toString()].uni_tid)"></uni-list-item>
			</uni-list>
		</div>
	</view>
</template>


<script>
	export default {
		data() {
			return {
				subjects: [],
				total_progress: 0,
				bar_style: "progress__bar",
				tips: "加载中..."
			}
		},
		onShow() {
			this.gettips()
			if (uni.getStorageSync('ini_update')) this.initialize()
		},
		onLoad() {
			this.initialize()
		},
		methods: {
			async gettips() {
				const db = uniCloud.database();
				let tipnumber = await db.collection("hwk_tips").count()
				tipnumber = Math.floor(Math.random() * (tipnumber.result.total))
				let tips = await db.collection('hwk_tips').skip(tipnumber).get()
				this.tips = "Tips: " + tips.result.data[0].content.toString();
			},
			initialize() {
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
				} else {
					this.load_tasks()
				}
			},
			go_detail(tid) {
				uni.setStorageSync('now_tid', tid);
				uni.navigateTo({
					url: "./detail/detail"
				})
			},
			async load_tasks() {
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
					let data_map = [];
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
						let thumb_url = data[j.toString()]['type'] === "notification" ? "/static/images/notice.png" : progress != data[j
								.toString()]['total'].toString() ?
							"/static/images/unfinished.png" : "/static/images/finished.png";
						// console.log('thumb', j, thumb_url);
						data_map.push({
							'uni_tid': data[j.toString()]['uni_tid'],
							'title': data[j.toString()]['title'],
							'note': data[j.toString()]['type'] === "notification" ? "通知" : "当前进度：" + progress + "/" + data[j.toString()][
								'total'
							].toString(),
							'thumb': thumb_url,
							'rightText': data[j.toString()]['title'] === "unfinished" ? "去完成" : "查看",
							'progress': data[j.toString()]['type'] === "notification" ? 1 : now / total,
						});
					}
					data_map.sort(function(a, b) {
						if (a.progress === b.progress) {
							if (a.note === '通知') {
								return -1
							}
							return 1
						} else {
							return a.progress - b.progress
						}
					})
					let progress = Math.round((now / total) * 100)
					let bar_style = "progress__bar "
					if (progress >= 30) bar_style += "progress__bar--orange "
					if (progress >= 55) bar_style += "progress__bar--yellow "
					if (progress >= 85) bar_style += "progress__bar--green "
					this.subjects.push({
						'name': this.json_data['subjects'][i.toString()]['name'],
						'tasks': data_map,
						'progress': progress,
						'bar_style': bar_style
					});
					total_total += total;
					total_now += now;
				}
				this.total_progress = Math.round((total_now / total_total) * 100)
				const db = uniCloud.database();
				db.collection("hwk_ranklist").where({
					"email": uni.getStorageSync("usr_email")
				}).update({
					email: uni.getStorageSync("usr_email"),
					progress: this.total_progress
				})
				uni.setStorageSync('total_progress', this.total_progress)
				this.bar_style = "progress__bar "
				if (this.total_progress >= 30) this.bar_style += "progress__bar--orange "
				if (this.total_progress >= 55) this.bar_style += "progress__bar--yellow "
				if (this.total_progress >= 85) this.bar_style += "progress__bar--green "
				uni.stopPullDownRefresh()
				// console.log("started.");
				// console.log('subjects:', this.subjects);
				// console.log('this.json_data', this.json_data);
				// console.log('this.json_data[subjects]', this.json_data['subjects']);
				// console.log('this.json_data[subjects][data]', this.json_data['subjects']['0']);
				// console.log('this.json_data[length]', this.json_data['subjects']['length']);
				// console.log(this.subjects[0])
			}
		},
		async onPullDownRefresh() {	
			await this.gettips()
			await this.load_tasks()
		}
	}
</script>

<style>
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
