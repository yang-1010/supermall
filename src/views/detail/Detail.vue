<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titleClick="titleClick" ref="nav"/>
    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll">
      <detail-swiper :top-images="topImages"/>
      <detail-base-info :goods="goods"/>
      <detail-shop-info :shop="shop"/>
      <detail-goods-info :detail-info="detailInfo" @imageLoad="imageLoad"/>
      <detail-param-info ref="param" :param-info="paramInfo"/>
      <detail-comment-info ref="comment" :comment-info="commentInfo"/>
      <goods-list ref="recommend" :goods="recommends"/>
    </scroll>
    <back-top @click.native="backClick" v-show="isShowBackTop"/>
    <detail-bottom-bar @addToCart="addToCart"/>
  </div>
</template>

<script>
  import DetailNavBar from './childComps/DetailNavBar'
  import DetailSwiper from './childComps/DetailSwiper'
  import DetailBaseInfo from './childComps/DetailBaseInfo'
  import DetailShopInfo from './childComps/DetailShopInfo'
  import DetailGoodsInfo from './childComps/DetailGoodsInfo'
  import DetailParamInfo from './childComps/DetailParamInfo'
  import DetailCommentInfo from "./childComps/DetailCommentInfo"
  import DetailBottomBar from "./childComps/DetailBottomBar"

  import Scroll from 'components/common/scroll/Scroll'
  import GoodsList from "components/content/goods/GoodsList"
  import BackTop from "components/content/backTop/BackTop";

  import {getDetail, Goods, getRecommend, Shop, GoodsParam} from "network/detail";
  import {debounce} from "common/utils";

  export default {
    name: "Detail",
    components: {
      DetailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      DetailBottomBar,
      Scroll,
      GoodsList,
      BackTop
    },
    data() {
      return {
        iid: null,
        topImages: [],
        goods: {},
        shop: {},
        detailInfo: {},
        paramInfo: {},
        commentInfo: {},
        recommends: [],
        themeTopY: [],
        getThemeTopY: null,
        currentIndex: 0,
        isShowBackTop: false,
      }
    },
    created() {
      // 1.保存传入的iid
      this.iid = this.$route.params.iid;

      // 2.根据iid请求详情数据
      getDetail(this.iid).then(res => {
        // 1.获取数据和顶部的图片轮播数据
        //console.log(res);
        const data = res.result;
        this.topImages = data.itemInfo.topImages;

        // 2.获取商品信息
        this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)

        // 3.创建店铺信息的对象
        this.shop = new Shop(data.shopInfo)

        // 4.保存商品的详情数据
        this.detailInfo = data.detailInfo;

        // 5.获取参数的信息
        this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

        // 6.获取评论的信息
        if (data.rate.cRate !== 0) {
          this.commentInfo = data.rate.list[0];
        }

        // // 7.执行下一步,
        // this.$nextTick(() => {
        //   // 根据最新数据，DOM已渲染完，但图片没加载完
        //   this.themeTopY = [];
        //   this.themeTopY.push(0);
        //   this.themeTopY.push(this.$refs.param.$el.offsetTop);
        //   this.themeTopY.push(this.$refs.comment.$el.offsetTop);
        //   this.themeTopY.push(this.$refs.recommend.$el.offsetTop);
        //   console.log(this.themeTopY);
        // })
      })

      // 3.请求推荐信息
      getRecommend().then(res => {
        // console.log(res)
        this.recommends = res.data.list
      })

      // 4.给getThemeTopY赋值（防抖）
      this.getThemeTopY = debounce(() => {
        this.themeTopY = [];
        this.themeTopY.push(0);
        this.themeTopY.push(this.$refs.param.$el.offsetTop);
        this.themeTopY.push(this.$refs.comment.$el.offsetTop);
        this.themeTopY.push(this.$refs.recommend.$el.offsetTop);
        // // 空间换时间，多设个最大值
        // this.themeTopY.push(Number.MAX_VALUE);
      }, 100)
    },
    mounted() {
      // 1.图片加载完成的事件监听,这个是推荐里面的图片，与home共用，区分开
      const refresh = debounce(this.$refs.scroll.refresh, 50)
      this.$bus.$on('detailItemImageLoad', () => {
        refresh()
      })
    },
    updated() {
      // // 1.拿到offsetTop值，点击滚到相应位置
      // this.themeTopY = [];
      // this.themeTopY.push(0);
      // this.themeTopY.push(this.$refs.param.$el.offsetTop);
      // this.themeTopY.push(this.$refs.comment.$el.offsetTop);
      // this.themeTopY.push(this.$refs.recommend.$el.offsetTop);
    },
    methods: {
      imageLoad() {
        this.$refs.scroll.refresh();
        this.getThemeTopY();
      },
      titleClick(index) {
        this.$refs.scroll.scrollTo(0, -this.themeTopY[index] + 44, 300);
      },
      contentScroll(position) {
        // 1.获取y值
        const positionY = -position.y;

        // 2.position和标题位置值对比
        let length = this.themeTopY.length;
        // 普通做法
        for (let i = 0; i < length; i++) {
          if (this.currentIndex !== i &&
            ((i < length - 1 && positionY > this.themeTopY[i] && positionY <= this.themeTopY[i + 1]) ||
              (i === length - 1 && positionY >= this.themeTopY[i]))) {
            this.currentIndex = i;
            this.$refs.nav.currentIndex = this.currentIndex;
          }

        // // hack()空间换时间，多设个最大值
        // for (let i = 0; i < length - 1; i++) {
        //   if (this.currentIndex !== i &&
        //     ((i < length - 1 && positionY >= this.themeTopY[i] && positionY <= this.themeTopY[i + 1]))) {
        //     this.currentIndex = i;
        //     this.$refs.nav.currentIndex = this.currentIndex;
        //   }
        }

        // 3.是否显示回到顶部，点击回到顶部
        this.isShowBackTop = (-position.y) > 1000
      },
      backClick() {   //返回顶部
        this.$refs.scroll.scrollTo(0, 0, 300);
      },
      addToCart() {
        // 1.获取购物车需要展示的信息
        const product = {
          image: this.topImages[0],
          title: this.goods.title,
          desc: this.goods.desc,
          price: this.goods.nowPrice,
          iid: this.iid
        }

        // 2.将商品添加进购物车
        // this.$store.commit("addCart", product);      //mutations
        this.$store.dispatch("addCart", product).then(() => {
          this.$toast({message: '加入购物车成功'})
        })

      }
    }
  }
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }

  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }

  .content {
    height: calc(100% - 44px - 58px);
  }
</style>
