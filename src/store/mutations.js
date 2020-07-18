const mutations = {
  // 做一些单一的事，不要放太复杂的方法
  addCounter(state, payload){
    payload.count++;
  },
  addToCart(state, payload){
    payload.checked = true;
    state.cartList.push(payload);
  }
}

export default mutations

