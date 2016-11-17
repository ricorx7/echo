import { combineEpics } from 'redux-observable';
import {pingEpic} from './ping.js';
import {WebsocketEpic} from './websocketEpic.js';


export default combineEpics(

);