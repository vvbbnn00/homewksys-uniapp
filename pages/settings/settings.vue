<template>
	<view>
		<uni-list :border="true">
			<uni-list-item :title="user_name" :note="authority" :thumb="avatar" thumb-size="lg" :rightText="user_click"
			 clickable :to="user_to" link></uni-list-item>
		</uni-list>
		<uni-section title="任务设置" type="line"></uni-section>
		<uni-list>
			<uni-list-item title="切换您的选科">
				<template slot="footer">
					<picker @change="bindPickerChange" :value="index" :range="array">
						<view class="uni-input sub_text">当前选科 {{array[index]}} 点击更改</view>
					</picker>
				</template>

			</uni-list-item>
			<uni-list-item title="重置完成进度" clickable @click="reset_progress()"></uni-list-item>
		</uni-list>
		<uni-section title="显示设置" type="line"></uni-section>
		<uni-list>
			<uni-list-item title="在首页显示[一言]" @switchChange="switch_one" :switchChecked="open_one" clickable :show-switch="true" note="开启后,首页会有[一言]的卡片"></uni-list-item>
			<uni-list-item :disabled="!open_one" title="设置[一言]来源" note="您可以指定每日一句的来源" clickable @click="one_sel_show = open_one===true ? true : false"></uni-list-item>
		</uni-list>
		<uni-section title="系统设置" type="line"></uni-section>
		<uni-list>
			<uni-list-item title="持续更新" @switchChange="switch_update" :switchChecked="update_switch" clickable :show-switch="true"
			 note="开启后,会重复出现加载框,若您认为这影响使用体验,可以关闭,但关闭后会存在数据不同步的bug"></uni-list-item>
			<uni-list-item title="每日任务" @switchChange="switch_everyday" :switchChecked="everyday_switch" clickable :show-switch="true"
			 note="由于班级差异,每周任务可能各不相同,若首页的每周任务与您班级不符,建议关闭"></uni-list-item>
			<!-- #ifdef APP-PLUS -->
			<uni-list-item title="检查更新" clickable @click="get_latest_version"></uni-list-item>
			<!-- #endif -->
			<uni-list-item title="问题反馈" note="如果没有加我的QQ,您可以在这里反馈问题" clickable to="feedback/feedback" link></uni-list-item>
			<uni-list-item title="关于软件" clickable to="../about/about"></uni-list-item>
		</uni-list>
	<multiple-select v-model="one_sel_show" :data="one_list" :default-selected="one_sel" @confirm="one_confirm_change"></multiple-select>
	</view>
</template>


<script>
	import md5 from '../../static/js/md5.js'
	import multipleSelect from '../../components/momo-multipleSelect/momo-multipleSelect.vue'
	export default {
		components: {
			multipleSelect
		},
		data() {
			return {
				user_name: "加载中",
				authority: "加载中",
				user_click: "加载中",
				avatar: "",
				user_to: "",
				array: [],
				array_id: [],
				index: 0,
				update_switch: false,
				everyday_switch: false,
				open_one: false,
				one_sel_show: false,
				one_list: [{
					label: '动画',
					value: 'a'
				}, {
					label: '漫画',
					value: 'b'
				}, {
					label: '游戏',
					value: 'c'
				}, {
					label: '文学',
					value: 'd'
				}, {
					label: '原创',
					value: 'e'
				}, {
					label: '来自网络',
					value: 'f'
				}, {
					label: '其他',
					value: 'g'
				}, {
					label: '影视',
					value: 'h'
				}, {
					label: '诗词',
					value: 'i'
				}, {
					label: '网易云',
					value: 'j'
				}, {
					label: '哲学',
					value: 'k'
				}, {
					label: '抖机灵',
					value: 'l'
				}],
				one_sel: ['a']
			}
		},
		onShow() {
			if (uni.getStorageSync('ini_update')) this.init()
		},
		onLoad() {
			this.init()
		},
		methods: {
			one_confirm_change(data){
				this.one_sel = data.map((item) => item.value)
				if (this.one_sel.length === 0) this.one_sel = ['a']
				uni.setStorageSync('ini_open_sel', this.one_sel)
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
			switch_one(status) {
				uni.setStorageSync("ini_open_one", status.value)
				this.open_one = uni.getStorageSync('ini_open_one')
			},
			switch_update(status) {
				uni.setStorageSync("ini_update", status.value)
			},
			switch_everyday(status) {
				uni.setStorageSync("ini_everyday", status.value)
			},
			async init() {
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
					//return
				}
				if (uni.getStorageSync('ini_update') === "") uni.setStorageSync('ini_update', true)
				if (uni.getStorageSync('ini_everyday') === "") uni.setStorageSync('ini_everyday', true)
				if (uni.getStorageSync('ini_open_one') === "") uni.setStorageSync('ini_open_one', true)
				if (uni.getStorageSync('ini_open_sel') === "") uni.setStorageSync('ini_open_sel', ['a'])
				this.update_switch = uni.getStorageSync('ini_update')
				this.everyday_switch = uni.getStorageSync('ini_everyday')
				this.open_one = uni.getStorageSync('ini_open_one')
				this.one_sel = uni.getStorageSync('ini_open_sel') 
				await this.get_sub_data()
				this.get_login_data()
				uni.stopPullDownRefresh()
			},
			reset_progress(who) {
				uni.showModal({
					title: '提示',
					content: '您确定要重置任务进度吗？这会使您的任务进度永久丢失。',
					confirmColor: "#b71540",
					success: async (res) => {
						if (res.confirm) {
							let {
								data: result
							} = await this.$ajax({
								url: '/hwk/reset_save',
								data: {
									token: uni.getStorageSync('token')
								}
							});
							uni.setStorageSync('total_progress', 0)
							uni.showToast({
								title: result.msg,
								duration: 1500,
								icon: "none"
							});
						}
					}
				});
			},
			async get_sub_data() {
				let {
					data: data
				} = await this.$ajax({
					url: "hwk/list_name.json"
				})
				this.array = [];
				this.array_id = [];
				for (let item in data) {
					this.array.push(data[item]);
					this.array_id.push(item);
				}
			},
			async get_login_data() {
				try {
					const token = uni.getStorageSync('token');
					if (token) {
						let {
							data: data
						} = await this.$ajax({
							url: "hwk/user_info?token=" + token
						})
						if (data['code'] !== 200) {
							this.user_to = "./login/login"
							this.user_name = "未登录";
							this.authority = "点击右侧登录按钮来登录";
							this.user_click = "登录";
							this.subject = "登录以查看选科"
							this.avatar = "https://cdn.v2ex.com/gravatar/?s=64&d=mm&r=g"
							return
						}
						this.user_to = "./user/user"
						this.user_name = data['name'];
						this.authority = data['email'];
						this.user_click = "查看";
						this.avatar = "https://cdn.v2ex.com/gravatar/" + md5(data['email']);
						if (data['t_id'] == undefined) {
							uni.showModal({
								title: "提示",
								content: "您尚未设置选科，请在[任务设置-切换您的选科]中设置。",
								showCancel: false,
							})
						}
						this.index = this.array_id.indexOf(data['t_id']);
						uni.setStorageSync("user_lid",data['t_id']);
					} else {
						this.user_to = "./login/login"
						this.user_name = "未登录";
						this.authority = "点击右侧登录按钮来登录";
						this.user_click = "登录";
						this.subject = "登录以查看选科"
						this.avatar = "https://cdn.v2ex.com/gravatar/?s=64&d=mm&r=g"
					}
				} catch (e) {
					console.log("获取失败", e);
				}
			},
			bindPickerChange: async function(e) {
				let {
					data: result
				} = await this.$ajax({
					url: "hwk/set_list",
					data: {
						token: uni.getStorageSync('token'),
						list_id: this.array_id[e.target.value]
					}
				})
				uni.showToast({
					title: result.msg,
					duration: 1500,
					icon: "none",
					position: "bottom"
				});
				this.init()
				// this.index = e.target.value
			},
			async get_latest_version() {
				let {
					data: result
				} = await this.$ajax({
					url: "hwk/version.json"
				})
				// console.log(plus.runtime.version)
				// console.log(result)
				let content = "新版本：" + result.version + "\n新版特性:\n"
				for (let item in result.log) {
					content += "- " + (result.log[item]) + "\n"
				}
				content += "点击【确定】以跳转至页面更新"
				if (plus.runtime.version !== result.version) {
					uni.showModal({
						title: "更新提示",
						content: content,
						success: (res) => {
							if (res.confirm) {
								this.open_url(result.url)
							}
						}
					})
				} else {
					uni.showModal({
						title: "提示",
						content: "已是最新版本",
						showCancel: false,
					})
				}
			},
			onPullDownRefresh() {
				this.init()
			}
		}
	}
</script>

<style>
	.sub_text {
		color: #a4b0be;
	}
</style>
