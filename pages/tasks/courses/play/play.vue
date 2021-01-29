<template>
	<view class="content">
		<view class="video-panel">
			<view>
				<video class="video-frame" v-if="reload_switch" id="myVideo" :src="src" @error="videoErrorCallback"
				 :danmu-list="empty" @timeupdate="show_time" enable-danmu :controls="false" :enable-progress-gesture="false"
				 :duration="duration" @waiting="is_waiting=true" @play="is_playing=true" :show-loading="false" :show-center-play-btn="false"
				 @loadedmetadata="loaded_fun" @ended="vid_stop" @fullscreenchange="update_full">
					<cover-view class="color-picker" v-if="show_color_picker">
						<center class="color-picker-title">选取弹幕颜色</center>
						<row class="color-row" justify="center" align="center">
							<o-col span="4">
								<cover-view class="color" @click="set_color('#FFFFFF')" style="background-color: #FFFFFF;"></cover-view>
							</o-col>
							<o-col span="4">
								<cover-view class="color" @click="set_color('#ff0000')" style="background-color: #ff0000;"></cover-view>
							</o-col>
							<o-col span="4">
								<cover-view class="color" @click="set_color('#ffaa00')" style="background-color: #ffaa00;"></cover-view>
							</o-col>
							<o-col span="4">
								<cover-view class="color" @click="set_color('#ffff00')" style="background-color: #ffff00;"></cover-view>
							</o-col>
							<o-col span="4">
								<cover-view class="color" @click="set_color('#55ff00')" style="background-color: #55ff00;"></cover-view>
							</o-col>
						</row>
						<row class="color-row" justify="center" align="center">
							<o-col span="4">
								<cover-view class="color" @click="set_color('#0000ff')" style="background-color: #0000ff;"></cover-view>
							</o-col>
							<o-col span="4">
								<cover-view class="color" @click="set_color('#00ffff')" style="background-color: #00ffff;"></cover-view>
							</o-col>
							<o-col span="4">
								<cover-view class="color" @click="set_color('#ff00ff')" style="background-color: #ff00ff;"></cover-view>
							</o-col>
							<o-col span="4">
								<cover-view class="color" @click="set_color('#bebebe')" style="background-color: #bebebe;"></cover-view>
							</o-col>
							<o-col span="4">
								<cover-view class="color" @click="set_color('#000000')" style="background-color: #000000;"></cover-view>
							</o-col>
						</row>
					</cover-view>
					<cover-view class="loading-cover" v-if="is_waiting===true">
						<center class="loading-center">
							<cover-image src="./static/loading.gif" style="height: 50rpx; width: 50rpx;"></cover-image>
							加载中
						</center>
					</cover-view>
					<cover-view class="listener" v-if="show_color_picker===false" @click="change_panel"></cover-view>
					<cover-view class="video-control" v-if="open_panel===true">
						<view class="upper-control">
							<view id="progress" class="progress" @click="print_pos" @touchstart="print_pos1" @touchmove="print_pos1">
								<view id="progress" class="progress-bar" :style="'width: '+((current/duration)*100)+'%'">
									<view class="progress-thumb" @click=""></view>
								</view>
							</view>
						</view>
						<row class="lower-control">
							<o-col span="10" align="center" justify="center">
								<row>
									<cover-image :src="'../../../../static/bzpl-video/'+(is_playing===false ? 'play.png' : 'pause.png')" class="ctrl_button"
									 @click="start_pause()"></cover-image>
									<text class="progress_text">{{trans_time(current)}}/{{trans_time(duration)}}</text>
								</row>
							</o-col>
							<o-col span="12">
								<row align="center" justify="left">
									<input v-model="danmuValue" class="uni-input" type="text" placeholder="发射一条友♂善的弹幕" />
									<cover-image src="../../../../static/bzpl-video/color-picker.png" class="ctrl_button" @click="show_color_picker=true"></cover-image>
									<cover-image src="../../../../static/bzpl-video/paper-plane.png" class="ctrl_button" @click="sendDanmu"></cover-image>
								</row>
							</o-col>
							<o-col span="1" align="center" justify="center">
								<row>
									<cover-image class="ctrl_button" :src="'../../../../static/bzpl-video/'+(is_fullscreen===false ? 'full.png' : 'exitfull.png')"
									 @click="fill_screen()" style="position: absolute; right: 10rpx;"></cover-image>
								</row>
							</o-col>
						</row>
					</cover-view>
				</video>
			</view>
		</view>
		<uni-card class="index_card" title="视频详情" mode="basic" icon="circle-filled" :is-shadow="true" extra="查看视频详细资料">
			<p><b>视频VID：</b>{{this.vid}}</p>
			<p><b>视频标题：</b>{{this.title}}</p>
			<p><b>视频介绍：</b></p>
			<rich-text :nodes="detail"></rich-text>
		</uni-card>
	</view>
</template>

<script>
	import Row from '@/components/oveui-layout/row/row.vue';
	import oCol from '@/components/oveui-layout/o-col/o-col.vue';
	//内容缓存管理器
	function XCache() {}
	//立刻缓存特定资源
	XCache.cache = function(p) {
		if (p instanceof Array) {
			for (var i = 0, len = p.length; i < len; i++)
				(new Image()).src = p[i];
		} else new Image().src = p;
	};

	export default {
		components: {
			Row,
			oCol
		},
		data() {
			return {
				vid: "加载中",
				empty: [],
				title: "加载中",
				detail: "加载中",
				src: '',
				now_clip: -1,
				current: 0,
				duration: 0,
				load_ok: false,
				reload_switch: true,
				is_playing: false,
				is_waiting: false,
				is_fullscreen: false,
				open_panel: true,
				show_color_picker: false,
				color: "#ffffff",
				file: {},
				dammuku: [],
				danmuValue: ''
			}
		},
		onReady: function(res) {
			this.videoContext = uni.createVideoContext('myVideo')
		},
		onLoad() {
			// uni.setStorageSync("watch_vid", "6013dbc4db4db10001bb92fc")
			this.vid = uni.getStorageSync("watch_vid")
			if (this.vid === "") {
				uni.showModal({
					title: "提示",
					content: "视频内容加载失败",
					showCancel: false
				})
			} else {
				this.load_vid_info(this.vid)
			}
		},
		methods: {
			set_color(color){
				this.color = color
				this.show_color_picker = false
			},
			update_full(res) {
				this.is_fullscreen = res.detail.fullScreen
			},
			change_panel() {
				this.open_panel = this.open_panel === true ? false : true
			},
			vid_stop() {
				this.is_playing = false
				this.videoContext.stop()
				this.current = 0
				this.reload_switch = false;
				this.$nextTick(() => {
					this.reload_switch = true;
				})
			},
			loaded_fun() {
				this.videoContext.seek(this.current - this.decide_video_clip(this.current).start_pos)
			},
			protect_fun() {
				if (this.current >= this.duration) {
					this.vid_stop()
				}
				if (this.is_playing) this.videoContext.play()
				setTimeout(this.protect_fun, 250)
			},
			print_pos1(pos) {
				let width = this.$el.querySelector('#progress').clientWidth;
				this.current = pos.touches[0].pageX / (width) * this.duration
				let data = this.decide_video_clip(this.current)
				if (this.now_clip !== data.index) {
					this.src = this.file.videos[data.index].url
				}
				if (!this.is_playing) {
					this.videoContext.pause()
				} else {
					this.videoContext.pause()
				}
				this.videoContext.seek(this.current - data.start_pos)
			},
			print_pos(pos) {
				let width = this.$el.querySelector('#progress').clientWidth;
				let margin = 25;
				this.current = (pos.detail.x - margin) / (width) * this.duration
				let data = this.decide_video_clip(this.current)
				if (this.now_clip !== data.index) {
					this.src = this.file.videos[data.index].url
				}
				if (!this.is_playing) {
					this.videoContext.pause()
				} else {
					this.videoContext.play()
				}

				this.videoContext.seek(this.current - data.start_pos)
			},
			fill_screen() {
				if (this.is_fullscreen === false) {
					this.videoContext.requestFullScreen()
				} else {
					this.videoContext.exitFullScreen()
				}
			},
			decide_video_clip(current) {
				let tmp = 0
				for (let index in this.file.videos) {
					tmp += this.file.videos[index].duration
					if (tmp > current) {
						if (tmp - current <= 10) {
							try {
								XCache.cache(this.file.videos[index + 1].url);
							} catch {}
						}
						return {
							index: index,
							start_pos: tmp - this.file.videos[index].duration
						}
					}
				}
				return {
					index: this.file.videos.length - 1,
					start_pos: tmp - this.file.videos[this.file.videos.length - 1].duration
				}
			},
			start_pause() {
				if (this.current >= this.duration) {
					this.current = 0.000001
					this.now_clip = 0
				}
				if (this.is_playing) {
					this.is_playing = false
					this.videoContext.pause()
				} else {
					this.is_playing = true
					this.videoContext.play()
				}
				this.load_ok = true
			},
			async load_vid_info(vid) {
				const db = uniCloud.database();
				const info_coll = db.collection("hwk_vid_info")
				const dammu_coll = db.collection("hwk_vid_dammuku")
				this.file = await info_coll.where({
					"_id": vid
				}).get()
				this.file = this.file.result.data[0]

				let dammuku = await dammu_coll.where({
					"vid": vid
				}).limit(3000).get()
				this.file.dammuku = dammuku.result.data
				this.duration = this.file.duration
				this.detail = this.file.detail
				this.title = this.file.title
				this.current = 0
				this.src = this.file.videos[0].url
				this.dammuku = this.file.dammuku
				this.protect_fun()
			},
			show_time(res) {
				this.is_waiting = false
				this.load_ok = true
				let now_t = res.detail.currentTime // 视频真实时间
				let data = this.decide_video_clip(this.current) // 获得播放的视频片段信息
				let now = this.now_clip
				this.src = this.file.videos[data.index].url
				if (now !== data.index) {
					this.now_clip = data.index
					// this.videoContext.danmuList=[]
					// this.reload_switch = false;
					// this.$nextTick(() => {
					// 	this.reload_switch = true;
					// })
					return
				}
				this.now_clip = data.index
				this.current = now_t + data.start_pos
				for (let index in this.dammuku) {
					if (Math.abs(this.current - this.dammuku[index].timestamp) <= 1) {
						if (this.dammuku[index].locked) continue
						this.videoContext.sendDanmu({
							text: this.dammuku[index].text,
							color: this.dammuku[index].color
						});
						this.dammuku[index].locked = true
						setTimeout((who, index) => {
							who.dammuku[index].locked = false
						}, 4000, this, index)
					}
				}

				/* 旧版弹幕控制方法，存在问题
				try
				{
					if (this.dammuku[0].time < this.current) {
						this.videoContext.sendDanmu({
							text: this.dammuku[0].text,
							color: this.dammuku[0].color
						});
						this.dammuku.shift()
					}
				}
				catch{
					
				}
				*/
			},
			trans_time(sec) {
				let hours = Math.floor(sec / 3600)
				let minutes = Math.floor(sec / 60) - hours * 60
				let secs = Math.floor(sec - hours * 3600 - minutes * 60)
				return (hours == 0 ? "" : hours <= 9 ? "0" + hours.toString() + ":" : hours.toString() + ":") + (minutes <= 9 ? "0" +
					minutes.toString() + ":" : minutes.toString() + ":") + (secs <= 9 ? "0" + secs.toString() :
					secs.toString())
			},
			sendDanmu: function() {
				let pass = true
				if (uni.getStorageSync("usr_email") === "") {
					uni.showModal({
						title: "提示",
						content: "您未登录，为防止恶意发言，您的弹幕仅自己可见",
						showCancel: false
					})
					pass = false
				}
				if (this.danmuValue.trim() !== "") {
					let data = {
						vid: this.vid,
						email: uni.getStorageSync("usr_email"),
						text: this.danmuValue,
						color: this.color,
						timestamp: this.current
					}
					this.dammuku.push(data)
					if (pass) {
						const db = uniCloud.database();
						db.collection("hwk_vid_dammuku").add(data)
					}
					this.danmuValue = '';
				}
			},
			videoErrorCallback: function(e) {
				if (!this.load_ok) {
					return
				}
				uni.showModal({
					content: "播放出现错误！",
					showCancel: false
				})
			},
			getRandomColor: function() {
				const rgb = []
				for (let i = 0; i < 3; ++i) {
					let color = Math.floor(Math.random() * 256).toString(16)
					color = color.length == 1 ? '0' + color : color
					rgb.push(color)
				}
				return '#' + rgb.join('')
			}
		},
	}
</script>

<style>
	.color-row {
		margin-top: 20rpx;
		margin-bottom: 20rpx;
	}

	.color {
		width: 50rpx;
		height: 35rpx;
		border: 1rpx solid #EEEEEE;
		border-radius: 10rpx;
		cursor: pointer;
	}

	.color-picker-title {
		color: #EEEEEE;
		margin-top: 20rpx;
		margin-bottom: 10rpx;
	}

	.color-picker {
		top: 50%;
		left: 50%;
		position: absolute;
		transform: translate(-50%, -50%);
		width: 350rpx;
		height: 200rpx;
		background-color: rgba(0, 0, 0, 0.5);
		border: 1rpx solid #EEEEEE;
		border-radius: 20rpx;
	}

	.progress_text {
		margin-top: 5rpx;
	}


	.content {
		padding-top: 5rpx;
		padding-bottom: 20rpx;
	}

	.listener {
		height: 80%;
		width: 100%;
		position: absolute;
		top: 0;
	}

	.uni-input {
		color: #FFFFFF;
		background-color: rgba(255, 255, 255, 0.5);
		width: 40%;
		border-radius: 20px;
		margin-right: 5rpx;
	}

	.loading-cover {
		background-color: rgba(0, 0, 0, 0.5);
		height: 100%;
		transition: width 0.2s;
		-moz-transition: width 0.2s;
		/* Firefox 4 */
		-webkit-transition: width 0.2s;
		/* Safari 和 Chrome */
		-o-transition: width 0.2s;
		/* Opera */
	}

	.loading-center {
		width: 10%;
		height: 10%;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #FFFFFF;
		transition: width 0.2s;
		-moz-transition: width 0.2s;
		/* Firefox 4 */
		-webkit-transition: width 0.2s;
		/* Safari 和 Chrome */
		-o-transition: width 0.2s;
		/* Opera */
	}

	.video-panel {
		margin: 10px;
		text-align: center;
	}

	.control-buttons {
		position: relative;
		display: block;
		width: 100%;
	}

	.video-control {
		/*height: 30px;*/
		width: 100%;
		bottom: 0;
		position: absolute;
		padding-bottom: 10px;
		background-color: rgba(0, 0, 0, 0.5);
		color: #FFFFFF;
	}

	.upper-control {
		padding-left: 15px;
		padding-right: 15px;
	}

	.lower-control {
		padding-top: 15rpx;
		padding-bottom: 5rpx;
		padding-left: 15px;
		padding-right: 5px;
		top: 50%;
	}

	.ctrl_button {
		height: 40rpx;
		width: 40rpx;
		margin-right: 10rpx;
		margin-left: 10rpx;
		cursor: pointer;
	}


	.video-frame {
		margin-top: 20rpx;
		min-height: 300px;
		width: 100% !important;
		box-shadow: 0px -1px 10rpx #BBBBBB;
	}

	.progress {
		width: 100%;
		height: 15px;
		border-radius: 10px;
		background: #F1F5FD;
		display: inline-block;
	}

	.progress .progress-bar {
		height: 100%;
		border-radius: 3px;
		background: #0072FF;
	}

	.progress .progress-bar .progress-thumb {
		width: 15px;
		height: 15px;
		border-radius: 50%;
		background: #FFFFFF;
		box-shadow: 0 0 15px 5px #0072FF;
		float: right;
		position: relative;
		left: 7px;
		top: 0px;
	}
</style>
