<template>
	<view :class="['o-col-'+Span, Offset]" :style="'padding:1rpx '+ Gutter +'rpx;'"
	@tap="onClick" :data-url="url" :data-opentype="type">
		<view v-if="bgClass!='' || bgStyle!=''" :class="bgClass" :style="Radius + bgStyle">
			<slot></slot>
		</view>
		<slot v-else></slot>
	</view>
</template>

<script>
	export default {
		name: "o-col",
		props:{
			span:{
				type:[Number,String],
				default:24
			},
			offset:{
				type:[Number,String],
				default:0
			},
			url:{
				type:String,
				default:''
			},
			type:{
				type:String,
				default:'to'
			},
		},
		inject: ['gutter','bgclass','bgstyle','radius'],
		computed:{
			Span(){
				if(this.span > 24) return 24;
				else if(this.span < 1) return 1;
				else return this.span;
			},
			Offset(){
				if(this.offset >= 1 || this.offset < 24) 
					return 'offset-'+this.offset;
				else return '';
			},
			Radius(){
				if(this.radius > 0)
					return 'border-radius:'+this.radius+'rpx;overflow:hidden;';
				else return '';
			},
			bgStyle(){
				if(this.bgstyle != '')
					return 'background-color:'+this.bgstyle;
				else return '';
			},
			bgClass(){
				if(this.bgclass != '' && this.bgstyle == '')
					return this.bgclass;
				else return '';
			},
			Gutter(){
				if(this.gutter != '0' || this.gutter != 0)
					return this.gutter;
				else return ''
			}
		},
		methods: {
			onClick(e) {
				let url = e.currentTarget.dataset.url;
				let type = e.currentTarget.dataset.opentype;
				if (type=='tabbar'){
					uni.switchTab({ url: url })
				} else if(type=='back'){
					uni.navigateBack({ delta: 1 })
				} else {
					uni.navigateTo({ url: url })
				}
				this.$emit('Click');
			}
		}
	}
</script>

<style lang="scss">

	[class*="o-col-"] {
		float:left;
		box-sizing:border-box;
		> view{height:100%;}
	}
	.col-auto {flex: 0 0 auto;width: auto;max-width: 100%;}

	@for $col from 1 through 24 {
		.o-col-#{$col}{
			/* #ifdef APP-PLUS || H5 */
			flex: 0 0 calc(100%/24*#{$col});
			max-width:calc(100%/24*#{$col});
			/* #endif */
			/* #ifdef MP */
			width: calc(100%/24 * #{$col});
			/* #endif */
		}
	}

	@for $i from 1 through 23 {
		.offset-#{$i}{margin-left:calc(100%/24*#{$i})}
	}
	
	@for $col from 1 through 5 {
		.row.cols-#{$col}>*{
			flex:0 0 calc(100% / #{$col}) !important;
			max-width:calc(100% / #{$col}) !important;
		}
	}
	

</style>
