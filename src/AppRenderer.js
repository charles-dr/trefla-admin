import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
// import * as firebase from 'firebase';
import * as serviceWorker from './serviceWorker';
import { configureStore } from './redux/store';

// const firebaseConfig = {
//   apiKey: "AIzaSyBdnoTzHFUFDuI-wEyMiZSqPpsy4k4TYDM",
//   authDomain: "trefla.firebaseapp.com",
//   databaseURL: "https://trefla.firebaseio.com",
//   projectId: "trefla",
//   storageBucket: "trefla.appspot.com",
//   messagingSenderId: "139969386003",
//   appId: "1:139969386003:web:509097a8e125b7d967d1e6",
//   measurementId: "G-Z650WSCL04"
// };

// firebase.initializeApp(firebaseConfig);

const App = React.lazy(() => import(/* webpackChunkName: "App" */ './App'));

ReactDOM.render(
  <Provider store={configureStore()}>
    <Suspense fallback={<div className="loading" />}>
      <App />
    </Suspense>
  </Provider>,
  document.getElementById('root')
);
/*
 * If you want your app to work offline and load faster, you can change
 * unregister() to register() below. Note this comes with some pitfalls.
 * Learn more about service workers: https://bit.ly/CRA-PWA
 */
serviceWorker.unregister();
