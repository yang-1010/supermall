<template>
  <div id="cart">
    <nav-bar class="cart-nav"><div slot="center">购物车({{cartCount}})</div></nav-bar>
    <cart-list class="cart-list" :cart-list="cartList"></cart-list>
    <bottom-bar></bottom-bar>
  </div>
</template>

<script>
  import NavBar from "components/common/navbar/NavBar";
  import CartList from './childComps/CartList'
  import BottomBar from './childComps/BottomBar'

  import { mapGetters } from 'vuex'

  export default {
    name: "Cart",
    components: {
      NavBar,
      CartList,
      BottomBar
    },
    computed: {
      cartList() {
        return this.$store.getters.cartList
      },
      cartCount() {
        return this.$store.getters.cartCount
      },

      // // 第2种写法mapGetters辅助函数
      // ...mapGetters({
      //   cartCount: 'cartCount',
      //   cartlist: 'cartList'
      // })
      // 简写 ...mapGetters(['cartCount','cartlist'])
    }
  }
</script>

<style scoped>
  #cart {
    /*position: relative;*/
    height: 100vh;
  }

  .cart-nav {
    background-color: var(--color-tint);
    color: #fff;
  }

  .cart-list {
    overflow: hidden;
    position: absolute;
    top: 44px;
    bottom: 93px;
    width: 100%;
  }
</style>
