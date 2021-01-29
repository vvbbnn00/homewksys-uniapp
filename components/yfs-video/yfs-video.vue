<template>
	<view class="bbl-content">
		<view class="uni-padding-wrap uni-common-mt">
		            <view class="bbl-content_video">
		                <video 
						id="myVideo" 
						:src="src"
						:autoplay="autoplay"
						:loop="loop"
						:initial-time="initialtime"
						:duration="duration"
						:controls="false"
						:show-center-play-btn="false"
						:danmu-list="danmuList" 
						:enable-danmu="enabledanmu"
						:page-gesture="pagegesture"
						:direction="90"
						:objectFit="objectFit"
						:poster="poster"
						:enable-play-gesture="enableplaygesture"
						:videoTitle="videoTitle"
						@play="Clickplay"
						@pause="Clickpause"
		                @error="videoErrorCallback"
						@ended="Clickended"
						@timeupdate="Clicktimeupdate"
						@fullscreenchange="Clickfullscreenchange"
						@waiti="Clickwaitin"
						@click="clk"
						>
						<!--顶部栏 竖屏-->
						<cover-view class="video-control" v-if="isMenu" @tap.stop>
							<cover-view class="video-control-back" @tap.native.stop="backup">
								<cover-image src="../../static/yfs-video/backup.png"></cover-image>
							</cover-view>
							<cover-view class="video-control-text" v-if="isFullScree" @tap.native.stop="backup">
								{{ResVideoTitle}}
							</cover-view>
							<cover-view class="video-control-more" v-if="isFullScree">
								<cover-image src="../../static/yfs-video/more.png"></cover-image>
							</cover-view>
						</cover-view>
						
						<!--右侧播放速度菜单 竖屏-->
						<cover-view class="video-heizith-menu" v-if="!isFullScree">
							<cover-view class="video-control-item" @tap.native.stop="showSwitchRate">x {{currentRate}}</cover-view>
							<!-- <cover-view class="video-control-item">x {{currentRate}}</cover-view> -->
						</cover-view>
						<!--全屏左侧锁定-->
						<cover-view class="video-hz-lock" v-if="isFullScree&&isMenu" @tap.native.stop="lock">
							<cover-image :src="srcLock"></cover-image>
						</cover-view>
						<!--全屏右侧截屏-->
						<!-- <cover-view class="video-hz-jp" @tap.native.stop="tapImg">
							<cover-image :src="srcLock"></cover-image>
						</cover-view> -->
						<!--底部栏 竖屏 非全屏-->
						<cover-view class="video-control-bottom" v-if="isMenu&&!isFullScree" @tap.native.stop>
							<!--播放暂停区域-->
							<cover-view class="video-control-bottom-playOrPause" @tap.native.stop="playPause">
								<cover-image :src="playOrPauseSrc" mode="aspectFit"></cover-image>
							</cover-view>
							<!--时间区域-->
							<cover-view class="video-control-bottom-time">
								{{currtime}}/{{druation}}
							</cover-view>
							<!--进度条区域-->
							<cover-view class="video-control-bottom-bar" :style="[{width:dotBaseWidth +'rpx'}]">
								<!--灰色进度条区域-->
								<cover-view class="video-control-bottom-bar-gray">
									<!--动态有进度进度条区域-->
									<cover-view class="video-control-bottom-bar-color" 
									:style="[{width:dotSlide + 'rpx'}]"></cover-view>
								</cover-view>
								<cover-view class="video-control-bottom-bar-dot" 
								:style="[{left:dotSlide + 'rpx'}]" 
								@touchmove.stop.prevent="moveDot" 
								@touchstart="touchstartDot" 
								@touchend="touchendDot">
									<cover-view class="video-control-bottom-bar-dot-pad"></cover-view>
								</cover-view>
							</cover-view>
							<!--全屏按钮区域-->
							<cover-view class="video-control-bottom-fullScree" @tap.native.stop="fullscree">
								<cover-image src="../../static/yfs-video/full.png"></cover-image>
							</cover-view>
						</cover-view>
						<!--底部栏 竖屏 全屏-->
						<cover-view class="video-control-bottom" v-if="isMenu&&isFullScree" @tap.stop>
							<!--播放暂停区域-->
							<cover-view class="video-control-bottom-playOrPause" @tap.native.stop="playPause">
								<cover-image :src="playOrPauseSrc" mode="aspectFit"></cover-image>
							</cover-view>
							<!--时间区域-->
							<cover-view class="video-control-bottom-time">
								{{currtime}}/{{druation}}
							</cover-view>
							<!--进度条区域-->
							<cover-view class="video-control-bottom-bar" 
							:style="[{width:dotBaseWidth +'rpx'}]">
								<!--灰色进度条区域-->
								<cover-view class="video-control-bottom-bar-gray">
									<!--动态有进度进度条区域-->
									<cover-view class="video-control-bottom-bar-color" 
									:style="[{width:dotSlide + 'rpx'}]"
									></cover-view>
								</cover-view>
								<cover-view 
								class="video-control-bottom-bar-dot" 
								:style="[{left:dotSlide + 'rpx'}]" 
								@touchmove.stop.prevent="moveDot"
								@touchstart="touchstartDot" 
								@touchend="touchendDot">
									<cover-view class="video-control-bottom-bar-dot-pad"></cover-view>
								</cover-view>
							</cover-view>
							<cover-view class="video-fullScree-speed" @tap.native.stop="showSwitchRate">x {{currentRate}}</cover-view>
							<!--全屏按钮区域-->
							<cover-view class="video-control-bottom-fullScree" @tap.native.stop="fullscree">
								<cover-image src="../../static/yfs-video/exitfull.png"></cover-image>
							</cover-view>
						</cover-view>
						<!--上顶菜单栏-->
						<cover-view class="multi-list rate" :class="{ active: rateShow }" @tap.native.stop>
							<cover-view
								v-for="(item, index) in ['0.5', '0.8', '1.0', '1.25', '1.5']"
								:key="index"
								class="multi-item rate"
								:data-rate="item"
								@tap="switchRate"
								:class="{ active: item == currentRate }"
							>
								{{ item }}
							</cover-view>
						</cover-view>
						</video>
		            </view>
		        </view>
			</view>
</template>

<script>
export default {
	props:{
		src:{//视频路径
			type:String,
			default:''
		},
		videoTitle:{//视频标题
			type:String,
			default:''
		},
		autoplay:{//是否自播放
			type:Boolean,
			default:false
		},
		loop:{//是否循环播放
			type:Boolean,
			default:false
		},
		muted:{//是否静音播放
			type:Boolean,
			default:false
		},
		initialtime:{//指定视频初始播放位置 单位为秒（s）
			type:Number,
			default:0
		},
		duration:{//指定视频时长
			type:Number,
			default:0
		},
		danmuList:{//弹幕列表
			type: Array,
			default:()=>[]
		},
		enabledanmu:{//是否展示弹幕，只在初始化时有效，不能动态变更
			type:Boolean,
			default:true
		},
		pagegesture:{//在非全屏模式下，是否开启亮度与音量调节手势
			type:Boolean,
			default:false
		},
		objectFit:{//当视频大小与 video 容器大小不一致时，视频的表现形式。contain：包含，fill：填充，cover：覆盖
			type:String,
			default:'contain'
		},
		poster:{//视频封面的图片网络资源地址，如果 controls 属性值为 false 则设置 poster 无效
			type:String,
			default:''
		},
		enableplaygesture:{//是否开启播放手势，即双击切换播放/暂停
			type:Boolean,
			default:true
		}
	},
    data() {
        return {
			rateShow: false,//是否显示播放速度选项
			fullControlsWidth:0,//屏幕窗口宽度
			fullControlsHeigt:0,//屏幕窗口高度
			currentRate: '1.0',//当前播放速度
			videoCtx:'',//视频上下文
			touchStartTime:0,//双击视频播放还是暂停
			damu:{},//弹幕
			dotLeftBase:0,//基础偏移度 初步计算为滑块的半径 现在 为0
			dotSlide:0,//进度
			dotBaseWidth:0,//进度条计算后宽度
			isMenu:true,//是否显示控制面板
			currtime:'00:00:00',//当前播放时间 字符串 计算后
			druation:'00:00:00',//总时间 字符串 计算后
			durationInt:0,//总时间
			currentInt:0,//当前播放时间
			isPlay:false,//是否播放
			isFullScree:false,//是否全屏
			// ismoregn:false,
			rdo:0.94,//基础比例 为了设置进度条
			playOrPauseSrc:'../../static/yfs-video/play.png',//播放或者暂停图片
			srcLock:'../../static/yfs-video/uplock.png',//锁住横屏
			isLock:false//是否锁屏
        }
    },
	created() {
		this.fullControlsWidth = uni.getSystemInfoSync().screenWidth;
		this.fullControlsHeigt = uni.getSystemInfoSync().screenHeight;
		this.dotBaseWidth = this.fullControlsWidth * 1.2;
	},
	onBackPress:function(event){
		this.isFullScree = false;
	},
	computed:{
		ResVideoTitle(){
			let title = this.videoTitle;
			if(title.length > 39){
				title = title.substr(0,39);
				return title;
			}else{
				return title;
			}
		}
	},
	onResize:function() {
		let that = this;
		uni.getSystemInfo({  
			success: function(res) { 
				if (res.windowWidth > res.windowHeight) {//横屏
					  that.fullscree();
				} else {//竖屏
					that.fullscree();
				}  
			}  
		});  
	},
    onReady: function(res) {
		// #ifdef APP-NVUE || APP-PLUS || APP-PLUS-NVUE
		this.videoCtx = uni.createVideoContext("myVideo");
		// #endif
		// #ifdef MP-WEIXIN
		this.videoCtx = uni.createVideoContext("myVideo",this);
		// #endif
    },
    methods: {
        videoErrorCallback: function(e) {//视频加载错误
            uni.showModal({
                content: e.target.errMsg,
                showCancel: false
            })
        },
		sendDanMu:function(obj){//发送弹幕
			this.videoCtx.sendDanmu(obj);
		},
		Clickplay:function(e){
			let that = this;
			this.isPlay = true;
			this.playOrPauseSrc = '../../static/yfs-video/pause.png';
		},
		Clickpause:function(e){
			this.isPlay = false;
			this.playOrPauseSrc = '../../static/yfs-video/play.png';
		},
		Clickended:function(){//当播放到末尾时触发 ended 事件
			console.log("ended")
		},
		Clicktimeupdate:function(event){//播放进度变化时触发，event.detail = {currentTime, duration} 。触发频率 250ms 一次
			this.$emit("getTimeVideo",event.detail.currentTime);
			this.dotSlide = (event.detail.currentTime / event.detail.duration)*this.dotBaseWidth*this.rdo;
			this.druation = this.formatSeconds(event.detail.duration);
			this.currtime = this.formatSeconds(event.detail.currentTime);
			this.durationInt = event.detail.duration;
			this.currentInt = event.detail.currentTime;
		},
		Clickfullscreenchange:function(e){//当视频进入和退出全屏时触发，event.detail = {fullScreen, direction}，direction取为 vertical 或 horizontal
			// if (e.detail.direction == 'horizontal') {
			// 	this.isFullScree = true;
			// } else {
			// 	this.isFullScree = false;
			// }
			// this.isFullScree = !this.isFullScree;
			if(!this.isFullScree){
				this.dotBaseWidth = this.fullControlsHeigt * 1.4;
			}else{
				this.dotBaseWidth = this.fullControlsWidth * 1.2;
			}
			this.isFullScree = !this.isFullScree;
		},
		Clickwaitin:function(){//视频出现缓冲时触发
			console.log("Clickwaitin")
		},
		showSwitchRate:function(rate) {
			let that = this;
			that.rateShow = true;
		},
		switchRate:function(e) {
			let that = this;
			let rate = Number(e.currentTarget.dataset.rate);
			that.currentRate = rate;
			that.rateShow = false;
			that.videoCtx.playbackRate(rate*1);
			if(!that.isPlay){
				that.videoCtx.play();
			}
		},
		clk:function(){//video点击事件
			let that = this;
			that.isMenu = !that.isMenu;
			that.rateShow = false;
			//实现双击事件播放与暂停
			if (this.touchStartTime == 0) {
				this.touchStartTime = new Date().getTime();
			} else {
				if (new Date().getTime() - this.touchStartTime <= 300) {
					if(!that.isPlay){
						that.videoCtx.play();
					}else{
						that.videoCtx.pause();
					}
				}
				this.touchStartTime = 0;
			}
		},
		formatSeconds(a) {
			var hh = parseInt(a/3600);  
			var mm = parseInt((a-hh*3600)/60);  
			if(mm<10) mm = "0" + mm;  
			var ss = parseInt((a-hh*3600)%60);  
			if(ss<10) ss = "0" + ss;  
			if(hh<10) hh = hh == 0?'':`0${hh}:`;  
			var length = hh  + mm + ":" + ss;  
			if(a>=0){  
				return length;  
			}else{  
				return "00:00";  
			}  
		},
		playPause:function(){
			let that = this;
			if(!that.isPlay){
				that.videoCtx.play();
			}else{
				that.videoCtx.pause();
			}
		},
		fullscree:function(){//vertical 或 horizontal
			if(this.isLock) {return false;}
			if(!this.isFullScree){
				this.videoCtx.requestFullScreen({direction: 'horizontal'});
				this.dotBaseWidth = this.fullControlsHeigt * 1.4;
			}else{
				this.videoCtx.exitFullScreen();
				this.dotBaseWidth = this.fullControlsWidth * 1.2;
			}
		},
		backup:function(){
			if(this.isFullScree){
				this.fullscree();
				return false;
			}
			uni.navigateBack();
		},
		moregn:function(){
			this.ismoregn = !this.ismoregn;
		},
		hideModal:function(){
			this.ismoregn = false;
		},
		moveDot:function(e){//进度条移动点 触摸移动
			// 单指触摸 不是单指触摸不移动
			if (e.touches.length !== 1) {
				return false;
			}
			
			this.dotSlide = e.touches[0].clientX;
			if(this.dotSlide < 0){//左边界
				this.dotSlide = 0;
			}
			if(this.dotSlide > this.dotBaseWidth*this.rdo){//右边界
				this.dotSlide = this.dotBaseWidth*this.rdo;
			}
			// this.dotSlide = this.dotSlide + (this.NewX - this.initX);
			let time = (this.dotSlide / this.dotBaseWidth*this.rdo)*this.durationInt;
			this.currentInt = time;
			this.currtime = this.formatSeconds(time);
			this.videoCtx.seek(time);			
		},
		touchstartDot:function(e){//进度条移动点 触摸开始
			// this.initX = e.changedTouches[0].clientX;
			console.log('startdot')
		},
		touchendDot:function(e){//进度条移动点 触摸结束
			// this.dotSlide = this.dotSlide + (this.NewX - this.initX);
			// let time = (this.dotSlide / this.dotBaseWidth)*this.durationInt;
			// this.videoCtx.seek(time);
			console.log('enddot')
		},
		lock:function(){
			if(this.isLock){
				this.srcLock = '../../static/yfs-video/uplock.png';
			}else{
				this.srcLock = '../../static/yfs-video/downlock.png';
			}
			
			this.isLock = !this.isLock;
		}
	}
}
</script>

<style>
	video{
		width: 100%;
	}
	video::-webkit-media-controls{
		display:none !important;
	 }
	.bbl-content{
		width: 100%;
	}
	.bbl-content_video{
		width: 100%;
	}
	.uni-padding-wrap.uni-common-mt{
		width: 100%;
	}
	#myVideo{
		width: 100%;
	}
.video {
	width: 100%;
}
.video-wrap {
	position: relative;
}
.multi-list.full-screen.vertical {
	height: 100vh !important;
	padding: 8vh 0;
}
.multi-list.full-screen.horizontal {
	height: 100vw !important;
	padding: 8vw 0;
}
.multi {
	position: absolute;
	right: 30rpx;
	top: 50%;
	transform: translateY(-50%);
	z-index: 998;
	width: 100rpx;
	color: red;
	padding: 10rpx 0;
	text-align: center;
	transition: color ease 0.3s;
}
.multi.rate {
	right: 30rpx;
	color: red;
}
.multi-list {
	position: absolute;
	height: 100%;
	width: 0;
	background-color: rgba(0, 0, 0, 0.65);
	top: 0;
	right: 0;
	transition: width 0.3s ease;
	z-index: 999;
	box-sizing: border-box;
	padding: 50rpx 0;
}
.multi-list.rate {
	padding: 25rpx 0;
}
.multi-list.active {
	width: 300rpx;
}
.multi-item {
	text-align: center;
	color: #fff;
	line-height: 80rpx;
	transition: color ease 0.3s;
}
.multi-item.rate {
	line-height: 70rpx;
}
.multi-item:hover,
.multi:hover {
	color: #00d8ff;
}
.multi-item.active {
	color: #00d8ff;
}
.cuIcon-more.text-white{
	color:#FFFFFF;
	font-size: 40upx;
}
.video-contrl-top{
	height: 80upx;
	line-height: 80upx;
	min-height: 80upx;
	display: flex;
	padding: 0;
	z-index: 999;
	background-color: rgba(0, 0, 0, 0.1);
	background: -webkit-gradient(linear, left top, left bottom, from(rgba(0,0,0,0.5)), to(rgba(0,0,0,0.1)));  
	background: -o-linear-gradient(top, rgba(0,0,0,0.5), rgba(0,0,0,0.5));  
	background: linear-gradient(to bottom,rgba(0,0,0,0.1), rgba(0,0,0,0.1));
}
.cu-list-tb{
	width: 60upx;
	height: 60upx;
	border-radius: 50%;
	background: #CCCCCC;
	padding: auto;
	margin: auto;
	text-align: center;
	height: auto;
	line-height: 60upx;
	align-items: center;
}
.cu-list{
	align-items: flex-start;
	justify-items: left;
	text-align: left;
	padding: 30upx 0;
}
.video-control {
	background-color: rgba(0, 0, 0, 0.2);
	height: 80upx;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 999;
	flex-direction: row;
	display: flex;
}
.video-control-back{
	position: relative;
	width: 60rpx;
	height: 100%;
	line-height: 80upx;
}
.video-control-back cover-image{
	position: absolute;
	top: 20rpx;
	left: 10rpx;
	width: 50%;
	height: 50%;
}
.video-control-text{
	color: #FFFFFF;
	width: 70%;
	height: 100%;
	text-align: left;
	line-height: 80upx;
	overflow: hidden;
	text-overflow: ellipsis;
	display: -webkit-box;
	word-break: break-all;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 1;
}
.video-control-more{
	position: relative;
	height: 100%;
	width: 80upx;
	margin-left: 10%;
}
.video-control-more cover-image{
	position: absolute;
	top: 20rpx;
	left: 10rpx;
	width: 50%;
	height: 50%;
}
/* 底部栏样式 */
.video-control-bottom{
	background-color: rgba(0, 0, 0, 0.2);
	height: 60rpx;
	position: absolute;
	padding-top: 10rpx;
	line-height: 60rpx;
	padding: 5upx;
	bottom: 0;
	left: 0;
	width: 100%;
	z-index: 999;
	display: flex;
	align-items: center;
	justify-items: center;
}
.video-control-bottom-playOrPause{
	height:80%;
	width: 48rpx;
	align-items: center;
	justify-items: center;
	padding-top: 10rpx;
	flex-shrink: none;
}
.video-control-bottom-playOrPause cover-image{
	width: 80%;
	height: 80%;
	margin: auto;
}
.video-control-bottom-time{
	height:80%;
	width: 185rpx;
	line-height: 48rpx;
	align-items: center;
	justify-items: center;
	text-align: center;
	margin-right: 10upx;
	flex-shrink: none;
	color: #FFFFFF;
	font-size: 20rpx;
}
.video-control-bottom-bar{
	height:80%;
	line-height: 48rpx;
	align-items: center;
	justify-items: center;
	flex-shrink: none;
	padding: 0 10rpx;
}
.video-control-bottom-bar-gray{
	background-color: #FCF7E9;
	position: relative;
	height: 5rpx;
	width: 94%;
	top: 45%;
	left: 12.5rpx;
	right: 12.5rpx;
	border-radius: 5rpx;
}
.video-control-bottom-bar-color{
	height: 100%;
	background-color: #e54d42;
}
.video-control-bottom-bar-dot{
	position: relative;
	width: 25rpx;
	height: 25rpx;
	line-height: 15rpx;
	border-radius: 50%;
	top: 15%;
	background-color: rgba(255,0,0,0.3);
	box-shadow: -1px 1px 1px 2px rgba(255,255,255,.1),-1px 1px 1px 0 rgba(0,0,0,0.1) inset;
}
.video-control-bottom-bar-dot-pad{
	width: 15upx;
	height: 15upx;
	border-radius: 50%;
	background: #e54d42;
	/* box-shadow: 0 0 2px 0 rgba(0,0,0,0.2) inset; */
	position: absolute;
	left: 0;
	top:0;
	right: 0;
	bottom: 0;
	margin: auto;
}
.video-control-bottom-fullScree{
	height:25rpx;
	width: 25rpx;
	flex-shrink: none;
	margin-right: 10rpx;
}
.video-control-bottom-fullScree cover-image{
	width: 100%;
	height: 100%;
}
.video-control-item{
	color: #CCCCCC;
	padding: 2rpx;
	margin-top: 10rpx;
	width: 100%;
}
.video-heizith-menu{
	position: absolute;
	right: 0;
	top: 20%;
	z-index: 998;
	/* background-color: rgba(0,0,0,0.1); */
	height: 100rpx;
	width: 80rpx;
	padding: 10rpx;
	padding-top: 30rpx;
	border-top-left-radius: 10rpx;
	border-bottom-left-radius: 10rpx;
	line-height: 200rpx;
	align-items: center;
	justify-items: center;
	text-align: center;
	flex-direction: row;
}
.video-fullScree-speed{
	margin-right: 20rpx;
	color: #FFFFFF;
	font-size: 25rpx;
	text-align: center;
	align-items: center;
}
.video-hz-lock{
	position: absolute;
	left: 50rpx;
	top: 45%;
	z-index: 998;
	background-color: rgba(0,0,0,0.1);
	height: 50rpx;
	width: 50rpx;
	border-radius: 50%;
	padding: 10rpx;
}
.video-hz-lock cover-image{
	height: 100%;
	width: 100%;
}
.video-hz-jp{
	position: absolute;
	right: 50rpx;
	top: 45%;
	z-index: 998;
	background-color: rgba(0,0,0,0.1);
	height: 50rpx;
	width: 50rpx;
	border-radius: 50%;
	padding: 10rpx;
}
.video-hz-jp cover-image{
	height: 100%;
	width: 100%;
}
</style>
