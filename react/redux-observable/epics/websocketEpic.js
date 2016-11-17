import { Observable } from 'rxjs';
import WebsocketObservable from './../containers/websocketObservable.jsx';
import { connect } from 'react-redux';


const MESSAGE = 'MESSAGE';
const START_SOCKET = 'START_SOCKET';
const STOP_SOCKET = 'STOP_SOCKET';

export function startSocket() {
  return (actions, store) => Observable
    .webSocket({
      url: 'ws://localhost:8989/ws',
      resultSelector: (msgEvent) => msgEvent.data
    })
    .map((payload) => ({ type: MESSAGE, payload: 'prefix-' + payload }))
    .takeUntil(actions.ofType(STOP_SOCKET))
    .catch((err) => {
      console.log('ws error', err);
      return Observable.of({type: 'ERROR'});
    });
}

export function stopSocket() {
  return {
    type: STOP_SOCKET
  };
}

const mapActionCreators = {
  startSocket,
  stopSocket
};

const mapStateToProps = (state) => ({
  socket: state.socket
});

//const WebsocketEpic = connect(mapStateToProps, mapActionCreators)(WebsocketObservable);

export default connect(mapStateToProps, mapActionCreators)(WebsocketObservable);

//export default WebsocketObservableContainer;