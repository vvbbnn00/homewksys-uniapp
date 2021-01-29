<script>
	import pageAnimation from './components/page-animation'
	export default {
		mixins: [pageAnimation],
		onLaunch: function() {
			console.log('--------------------------------')
			console.log('BZPL-HomeWorkSystem Loaded.')
			console.log('El Psy Congroo.')
			console.log('--------------------------------')
			// #ifdef APP-PLUS
			plus.screen.lockOrientation('portrait-primary');
			// #endif
		},
		onShow: function() {
			// console.log('App Show')
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
