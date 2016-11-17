const socketReducer = (state = 'initial', action) => {
  switch (action.type) {
    case MESSAGE:
      return action.payload;

    default:
      return state;
  }
};