import 'rxjs';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, Link, hashHistory } from 'react-router';

import Navigation from "./header.jsx";
import SerialDisplay from "./SerialDisplay.jsx";
import RecordedData from "./RecordedData.jsx";
import Layout from "./Layout.jsx";
//import configureStore from "./redux/configureStore.js";

import { createStore, applyMiddleware } from 'redux'
import sagaMonitor from './saga/sagaMonitor.js'
import createSagaMiddleware from 'redux-saga'
import reducer from  './saga/reducers';
import rootSaga from './saga/sagas';
import Counter from './saga/components/Counter'


const app = document.getElementById('app');

const sagaMiddleware = createSagaMiddleware({sagaMonitor})
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
)
sagaMiddleware.run(rootSaga)

// Finally, we render a <Router> with some <Route>s.
// It does all the fancy routing stuff for us.
ReactDOM.render((
  <Provider store={store}>
    <Router history={hashHistory}>
      <Route path="/" component={Layout}>
        <Route path="/serial" component={SerialDisplay} />
        <Route path="/recorded" component={RecordedData} />
      </Route>
    </Router>
  </Provider>
), document.getElementById('app'))