<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
		<view class="text-area">
			<br>
			<p class="title-smaller">{{version}}</p>
			<br>
			<p class="title-smaller">Author:不做评论</p>
			<p class="title-smaller">一个简单的实战作品。</p>
			<br>
			<p class="title-smaller">El Psy Congroo.</p>
			<br>
		</view>
		<uni-list-item title="开源声明" clickable link to="LICENSE/LICENSE"></uni-list-item>
		<uni-list-item title="查看GITHUB项目" clickable link @click="open_url('https://github.com/vvbbnn00/homewksys-uniapp')"></uni-list-item>
		<uni-list-item title="访问作者主页" clickable link @click="open_url('https://www.vvbbnn00.cn/')"></uni-list-item>
	</view>
</template>

<script>
	export default {
		data: function() {
			// #ifdef H5 || MP-WEIXIN || MP-QQ
			this.ver = "正在HTML环境下运行";
			// #endif
			// #ifdef APP-PLUS
			this.ver = "版本号：" + plus.runtime.version;
			// #endif
			return {
				title: "作业任务系统",
				version: this.ver,
			}
		},
		onLoad() {

		},
		methods: {
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

		}
	}
</script>

<style>
	.content {
		text-align: center;
		max-width: 550px;
		margin: auto;
		box-shadow: 0px -3px 10px #888888;
		min-height: 100%;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 20rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		padding-bottom: 30rpx;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
		text-align: center;
	}

	.title-smaller {
		font-size: 26rpx;
		color: #8f8f94;
		text-align: center;
	}
</style>
