import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';
import rootEpic from './epics';
import rootReducer from './reducers';


const epicMiddleware = createEpicMiddleware(rootEpic);

export default function configureStore() {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const store = createStore(
        rootReducer,
        applyMiddleware(
            epicMiddleware,
            routerMiddleware(browserHistory))
);

return store;
}