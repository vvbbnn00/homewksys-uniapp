// 全局请求路径，也就是后端的请求基准路径
let BASE_URL = ""
// 同时发送异步代码的次数，防止一次点击中有多次请求，用于处理
let ajaxTimes=0;
// 封装请求方法，并向外暴露该方法
export const ajax = (options)=>{
	BASE_URL = uni.getStorageSync("is_dev_mode")===true ? "http://dev.vvbbnn00.cn/" : "https://smfms.vvbbnn00.cn/"
	// 解构请求头参数
	if (options.local===undefined) options.local = true
	let header = {...options.header};
	ajaxTimes++;
	// 显示加载中 效果
	if (options.noloading===true){
	}else{
		uni.showLoading({
			title: "请稍后",
		    mask: true,
		});
	}
	return new Promise((resolve,reject)=>{
		try{
			uni.request({
				timeout:5000,
				url:options.local ? BASE_URL+options.url : options.url,
				method: options.method || 'GET',
				data: options.data || {},
				header: header,
				success: (res)=>{
					resolve(res)
				},
				fail: (err)=>{
					uni.showToast({
					    title: '加载失败',
						icon: 'none',
					    duration: 2000
					});
					reject(err)
				},
				// 完成之后关闭加载效果
				complete:()=>{
					ajaxTimes--;
					if(ajaxTimes===0){
				        //  关闭正在等待的图标
				        uni.hideLoading();
				    }
				}
			})
		}
		catch(e){
			uni.showToast({
			    title: '加载失败',
			    duration: 2000,
				icon: 'none'
			});
			reject(e)
		}

	})
}