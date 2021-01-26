<template>
	<view class="content">
		<uni-card :title="username" mode="title" :is-shadow="true" :thumbnail="avatar" :extra="email" :note="uid">
			<uni-list-item title="更换密码" link to="../change_pass/change_pass"></uni-list-item>
			<uni-list-item title="如何更换头像？" clickable @click="c_avatar()"></uni-list-item>
			<uni-list-item title="退出登录" clickable @click="logout()"></uni-list-item>
		</uni-card>
		<uni-section title="操作日志" type="line"></uni-section>
		<YSteps lineNum='0' color='#fff' backgroundColor='#2f3542' :infoList='list'></YSteps>
	</view>
</template>

<script>
	import md5 from '../../../static/js/md5.js'
	import YSteps from '../../../components/Y-Steps/Y-Steps.vue'
	export default {
		components: {
			YSteps
		},
		data() {
			return {
				list: [{
					'info': '加载中'
				}],
				uid: "加载中",
				email: "加载中",
				username: "加载中",
				avatar: "",
			}
		},
		onLoad() {
			this.get_login_data()
		},
		methods: {
			logout() {
				uni.showModal({
					title: '提示',
					content: '您确认要退出登陆吗',
					success: function(res) {
						if (res.confirm) {
							uni.setStorageSync('token', '');
							uni.showModal({
								title: '提示',
								content: '登出成功！',
								showCancel: false,
								success: function(res) {
									if (res.confirm) {
										uni.switchTab({
											url: '/pages/settings/settings'
										});
									}
								}
							});
						} else if (res.cancel) {}
					}
				});
			},
			c_avatar() {
				uni.showModal({
					title: '如何更换头像框',
					content: '由于经费和时间所限，本程序的后端并不自带自定义头像功能。要想更换自己的头像，需要在【Gravatar】官网进行修改。',
					showCancel: false,
				});
			},
			async get_login_data() {
				try {
					const token = uni.getStorageSync('token');
					if (token) {
						let {data:data} = await this.$ajax({
							url:"hwk/user_info?token=" + token
						})
						if (data['code'] !== 200) {
							uni.showToast({
								title: '获取用户信息失败！',
								icon: 'none',
								mask: true,
								duration: 2000
							});
							return
						}
						this.uid = "UID:" + data['uid'];
						this.username = data['name'];
						this.email = data['email'];
						let log_list = data['log'];
						log_list = JSON.parse(data['log']);
						this.list = [];
						for (let item in log_list) {
							this.list.push({
								date: item,
								info: log_list[item]
							});
						}
						if (this.list.length <= 0) {
							this.list = [{
								'info': '暂无日志'
							}];
						}
						this.list.reverse()
						this.avatar = "https://cdn.v2ex.com/gravatar/" + md5(data['email']);
					} else {
						uni.showToast({
							title: '获取用户信息失败！',
							icon: 'none',
							mask: true,
							duration: 2000
						});
					}
				} catch (e) {
					console.log("获取失败", e);
				}
			}
		}
	}
</script>

<style>

</style>
