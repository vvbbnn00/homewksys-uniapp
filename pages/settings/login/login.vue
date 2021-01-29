<template>
	<view class="page_login">
		<!-- 头部logo -->
		<view class="head">
			<view class="head_bg">
				<view class="head_inner_bg">
					<image style="width: 55px;height: 65px;" :src="imgInfo.head" class="head_logo" />
				</view>
			</view>
		</view>
		<!-- 登录form -->
		<view class="login_form">
			<view class="input">
				<view class="img">
					<uni-icons type="person-filled" size="30"></uni-icons>
				</view>
				<input type="text" v-model="username" placeholder="请输入电子邮箱" @input="onInputUser()">
				<view class="img">
					<uni-icons :type="imgInfo.clear_icon" size="24" @tap="delUser()"></uni-icons>
				</view>
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="locked-filled" size="30"></uni-icons>
				</view>
				<input :type="pwdType" :value="userpwd" @keydown.enter="login" @input="onInputPass" placeholder="请输入密码">
				<view class="img">
					<uni-icons :type="imgInfo.eye_icon" size="24" @tap="switchPwd()"></uni-icons>
				</view>
			</view>
		</view>
		<!-- 登录提交 -->
		<button class="submit" type="primary" @tap="login">登录</button>
		<view class="opts">
			<text @click="goReg" class="text">立即注册</text>
			<text @click="findPwd" class="text">忘记密码？</text>
		</view>
		<!-- 		<view class="quick_login_line">
			<view class="line" />
			<text class="text">快速登录</text>
			<view class="line" />
		</view>
		<view class="quick_login_list">
			<image @tap="thirdLogin('qq')" class="item" :src="imgInfo.qq" />
			<image @tap="thirdLogin('wechat')" class="item" :src="imgInfo.wechat" />
			<image @tap="thirdLogin('weibo')" class="item" :src="imgInfo.weibo" />
		</view> -->
	</view>
</template>
<script>
	export default {
		components: {

		},
		data() {
			const isUni = false
			return {
				username: '',
				userpwd: '',
				pwdType: 'password',
				imgInfo: {
					head: require('./images/head.png'),
					eye_icon: "",
					clear_icon: "",
					qq: isUni ? '/static/qq.png' : require('./images/qq.png'),
					wechat: isUni ? '/static/wechat.png' : require('./images/wechat.png'),
					weibo: isUni ? '/static/weibo.png' : require('./images/weibo.png')
				}
			}
		},
		methods: {
			onInputUser() {
				if (this.username !== "") {
					this.imgInfo.clear_icon = "clear";
				} else {
					this.imgInfo.clear_icon = "";
				}
			},
			onInputPass(e) {
				this.userpwd = e.target.value
				if (this.userpwd !== "") {
					this.imgInfo.eye_icon = "eye-filled";
				} else {
					this.imgInfo.eye_icon = "";
				}
			},
			delUser() {
				this.username = '';
				this.imgInfo.clear_icon = "";
			},
			switchPwd() {
				this.pwdType = this.pwdType === 'text' ? 'password' : 'text'
				this.imgInfo.eye_icon = this.imgInfo.eye_icon === 'eye-slash-filled' ?
					'eye-filled' : 'eye-slash-filled'
			},
			async login() {
				let u_pattern = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
				let p_pattern = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$).{6,20}$/
				if ((this.username.search(u_pattern)==-1)||(this.userpwd.search(p_pattern)==-1)){
					uni.showToast({
						title: '用户名或密码不正确',
						duration: 1000,
						position: "bottom",
						icon: "none"
					})
					return 
				}
				let data = {
					username: this.username,
					password: this.userpwd
				};
				const {data:result} = await this.$ajax({
					url:"hwk/login.do",
					data:data,
					method:"POST",
					header: {
						'content-type': 'application/x-www-form-urlencoded', 
					}
				});
				if (result.code==200){
					await uni.showToast({
						title: '登陆成功',
						duration: 1000,
						position: "bottom",
						icon: "none"
					})
					uni.setStorageSync('total_progress', 0)
					uni.setStorageSync('token', result.token)
					uni.switchTab({url: '/pages/settings/settings'});
				}
				else{
					uni.showToast({
						title: result.msg,
						duration: 1000,
						position: "bottom",
						icon: "none"
					})
				}
			},
			findPwd() {
				uni.showToast({
					title: '暂不支持，请联系管理员。',
					duration: 1000,
					position: "bottom",
					icon: "none"
				})
			},
			goReg() {
				uni.navigateTo({
					url: '/pages/settings/reg/reg'
				})
			},
			thirdLogin(type) {
				console.log(type)
			}
		}
	}
</script>
<style>
	page {
		height: auto;
		min-height: 100%;
		background-color: #f5f6f8;
	}
</style>
<style lang="scss" scoped>
	$logo-padding: 60px;
	$form-border-color: rgba(214, 214, 214, 1);
	$text-color: #B6B6B6;
	
	.page_login {
		padding: 10px;
		max-width: 550px;
		margin: auto;
	}

	.head {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: $logo-padding;
		padding-bottom: $logo-padding;

		.head_bg {
			border: 1px solid #fbecf1;
			border-radius: 50px;
			width: 100px;
			height: 0px;
			display: flex;
			align-items: center;
			justify-content: center;

			.head_inner_bg {
				border-radius: 40px;
				width: 80px;
				height: 80px;
				display: flex;
				background-color: #838383;
				align-items: flex-end;
				justify-content: center;
				overflow: hidden;
			}
		}
	}

	.login_form {
		display: flex;
		margin: 20px;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 1px solid $form-border-color;
		border-radius: 10px;

		.line {
			width: 100%;
			height: 1px;
			background-color: $form-border-color;
		}

		.input {
			width: 100%;
			max-height: 45px;
			display: flex;
			padding: 3px;
			flex-direction: row;
			align-items: center;
			justify-content: center;

			.img {
				min-width: 40px;
				min-height: 40px;
				margin: 5px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.img_del {
				width: 21px;
				height: 21px;
			}

			.img_pwd_switch {
				width: 28px;
				height: 12px;
			}

			input {
				outline: none;
				height: 30px;
				width: 100%;

				&:focus {
					outline: none;
				}
			}
		}
	}

	.submit {
		margin-top: 30px;
		margin-left: 20px;
		margin-right: 20px;
		color: white;
		background-color: #747d8c;
		-webkit-tap-highlight-color: #747d8c;
	}

	.submit:active {
		color: #dfe4ea;
		background-color: #57606f;
	}

	.opts {
		margin-top: 5px;
		margin-left: 25px;
		margin-right: 25px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		.text {
			font-size: 13px;
			color: $text-color;
		}
	}

	.quick_login_line {
		margin-top: 40px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;

		.line {
			height: 1px;
			width: 38%;
			background-color: rgba(211, 211, 213, 1);
		}

		.text {
			font-size: 13px;
			color: rgba(200, 200, 200, 1);
			margin: 2px;
		}
	}

	.quick_login_list {
		margin-top: 30px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;

		.item {
			width: 50px;
			height: 50px;
			margin: 20px;
		}
	}
</style>
