import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import ping from './pingReducer.js';

export default combineReducers({
  ping,
  routing: routerReducer
});