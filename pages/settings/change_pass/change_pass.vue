<template>
	<view class="page_login">
		<view class="login_form">
			<view class="input">
				<view class="img">
					<uni-icons type="email" size="30"></uni-icons>
				</view>
				<text class="info">{{email}}</text>
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="person-filled" size="30"></uni-icons>
				</view>
				<text class="info">{{name}}</text>
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="locked" size="30"></uni-icons>
				</view>
				<input type="password" v-model="userpwd" placeholder="原密码">
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="locked-filled" size="30"></uni-icons>
				</view>
				<input type="password" v-model="c_userpwd" placeholder="新密码">
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="locked-filled" size="30"></uni-icons>
				</view>
				<input type="password" v-model="v_userpwd" placeholder="确认新密码">
			</view>
			<view class="line" />
			<view class="notification">注意：密码长度6-20位，包含数字，英文，字符中的两种以上。</view>
		</view>
		<button class="submit" type="primary" @tap="login">修改密码</button>

	</view>
</template>
<script>
	export default {
		components: {

		},
		onLoad() {
			this.get_user_data()
		},
		data() {
			const isUni = false
			return {
				userpwd: "",
				c_userpwd: "",
				email: "加载中",
				school_number: "",
				name: "加载中",
				v_userpwd: ""
			}
		},
		methods: {
			async get_user_data(){
				let token = uni.getStorageSync('token')
				if (token === ""){
					uni.showModal({
						title:"错误",
						content:"查询用户信息失败！",
						showCancel:false,
						success: function (res) {
						    if (res.confirm) {
						        uni.redirectTo({
						        	url:"../settings"
						        });
						    }
						},
					});
				}
				let {data:data} = await this.$ajax({
					url: "hwk/user_info",
					data:{
						token: token,
					}
				})
				this.email = data.email;
				this.name = data.name;
			},
			async login() {
				let p_pattern = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$).{6,20}$/
				if ((this.c_userpwd.search(p_pattern) == -1)) {
					uni.showModal({
						title: '提示',
						content:"密码不符合安全强度要求！",
						showCancel:false
					})
					return
				}
				if (this.v_userpwd!==this.c_userpwd){
					uni.showModal({
						title: '提示',
						content:"两次密码不相同，请检查后在提交",
						showCancel:false
					})
					return
				}
				if (this.userpwd===this.c_userpwd){
					uni.showModal({
						title: '提示',
						content:"修改后密码与原密码相同",
						showCancel:false
					})
					return
				}
				let data = {
					email: this.email,
					ori_password: this.userpwd,
					new_password: this.c_userpwd,
				};
				const {data:result} = await this.$ajax({
					url: "hwk/c_pass.do", 
					data:data, 
					method: "POST",
					header: {
						'content-type': 'application/x-www-form-urlencoded',
					}
				});
				if (result.code == 200) {
					uni.showModal({
						title: '提示',
						content:"密码修改成功",
						showCancel:false,
						success:function(res){
							if (res.confirm){
								uni.setStorageSync('token', result.token)
								uni.switchTab({
									url: '/pages/settings/settings'
								});
							}
						}
					})
				} else {
					uni.showModal({
						title: '提示',
						content:result.msg,
						showCancel:false
					})
				}
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
	$text-color: #c8c8c8;

	.info{
		width: 100%;
		color: $text-color;
	}
	
	.notification {
		font-size: 25rpx;
		padding-left: 20rpx;
		padding-right: 20rpx;
		color: #1e90ff;
		padding-top: 10rpx;
		padding-bottom: 10rpx;
	}


	.page_login {
		padding: 10px;
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
