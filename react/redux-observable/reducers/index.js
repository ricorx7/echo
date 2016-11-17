import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import ping from './pingReducer.js';
import websocketReducer from './websocketReducer.js';

export default combineReducers({
  ping,
  routing: routerReducer,
  websocket: websocketReducer
});