import React, { useEffect } from 'react';
import { Row } from 'reactstrap';
import * as firebase from 'firebase';
import IntlMessages from '../../../helpers/IntlMessages';
import { Colxx, Separator } from '../../../components/common/CustomBootstrap';
import Breadcrumb from '../../../containers/navs/Breadcrumb';

import { testFunction } from '../../../api/test.api';

const Start = ({ match }) => {

  useEffect(() => {
    console.log('[Hey loaded]');
    // testFunction();
    const firebaseConfig = {
      apiKey: "AIzaSyBdnoTzHFUFDuI-wEyMiZSqPpsy4k4TYDM",
      authDomain: "trefla.firebaseapp.com",
      databaseURL: "https://trefla.firebaseio.com",
      projectId: "trefla",
      storageBucket: "trefla.appspot.com",
      messagingSenderId: "139969386003",
      appId: "1:139969386003:web:509097a8e125b7d967d1e6",
      measurementId: "G-Z650WSCL04"
    };
    
    firebase.initializeApp(firebaseConfig);
    firebase.functions().httpsCallable('helloWorld')
    .then(res => {
      console.log(res);
    })
  });

  return (
    <>
      <Row>
        <Colxx xxs="12">
          <Breadcrumb heading="menu.start" match={match} />
          <Separator className="mb-5" />
        </Colxx>
      </Row>
      <Row>
        <Colxx xxs="12" className="mb-4">
          <p>
            <IntlMessages id="menu.start" />
          </p>
        </Colxx>
      </Row>
    </>
  );
}
export default Start;
