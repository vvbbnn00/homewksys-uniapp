<template>
	<view class="page_login">
		<view class="login_form">
			<view class="input">
				<view class="img">
					<uni-icons type="email" size="30"></uni-icons>
				</view>
				<input type="text" v-model="email" placeholder="电子邮箱">
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="person-filled" size="30"></uni-icons>
				</view>
				<input type="text" v-model="name" placeholder="真实姓名(汉字)">
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="info" size="30"></uni-icons>
				</view>
				<input type="text" v-model="school_number" placeholder="四位学号(如0101)">
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="locked-filled" size="30"></uni-icons>
				</view>
				<input type="password" v-model="userpwd" placeholder="密码">
			</view>
			<view class="line" />
			<view class="input">
				<view class="img">
					<uni-icons type="locked-filled" size="30"></uni-icons>
				</view>
				<input type="password" v-model="c_userpwd" placeholder="确认密码">
			</view>
			<view class="line" />
			<view class="notification">注意：密码长度6-20位，包含数字，英文，字符中的两种以上。</view>
		</view>
		<button class="submit" type="primary" @tap="login">注册</button>

	</view>
</template>
<script>
	export default {
		components: {

		},
		data() {
			const isUni = false
			return {
				userpwd: "",
				c_userpwd: "",
				email: "",
				school_number: "",
				name: ""
			}
		},
		methods: {
			async login() {
				let n_pattern = /^[\u4e00-\u9fa5]{0,}$/
				let s_pattern = /^0[1-6][0-4][0-9]$/
				let u_pattern = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
				let p_pattern = /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$).{6,20}$/
				if ((this.email.search(u_pattern) == -1) || (this.userpwd.search(p_pattern) == -1) || (this.name.search(n_pattern) ==
						-1) || (this.school_number.search(s_pattern) == -1)) {
					uni.showModal({
						title: '提示',
						content:"注册表单中存在至少一项不符合注册要求，请检查后再提交",
						showCancel:false
					})
					return
				}
				if (this.userpwd!==this.c_userpwd){
					uni.showModal({
						title: '提示',
						content:"两次密码不相同，请检查后在提交",
						showCancel:false
					})
					return
				}
				let data = {
					email: this.email,
					password: this.userpwd,
					name: this.name,
					school_number: this.school_number,
				};
				const {data:result} = await this.$ajax({
					url:"hwk/reg.do",
					data:data,
					method:"POST",
					header: {
						'content-type': 'application/x-www-form-urlencoded', 
					}
				});
				if (result.code == 200) {
					await uni.showToast({
						title: '注册成功',
						duration: 1000,
						position: "bottom",
						icon: "none"
					})
					uni.setStorageSync('total_progress', 0)
					uni.setStorageSync('token', result.token)
					uni.switchTab({
						url: '/pages/settings/settings'
					});
				} else {
					uni.showToast({
						title: result.msg,
						duration: 1000,
						position: "bottom",
						icon: "none"
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
	$text-color: #B6B6B6;

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
