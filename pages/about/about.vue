<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
		<view class="text-area">
			<text class="title-smaller">\n {{version}}\n\n 一个简单的实战作品\n 作者：不做评论\nEmail：vvbbnn00@foxmail.com\n或者QQ\n\n El Psy Congroo.</text>
		</view>
	</view>
</template>

<script>	
	export default {
		data: function(){
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

		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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
		text-align: center;
	}
	
	.title-smaller {
		font-size: 26rpx;
		color: #8f8f94;
		text-align: center;
	}
</style>
