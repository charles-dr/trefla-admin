import React, { useState } from 'react'
import { Button, Collapse, CustomInput, Form, FormGroup, Label } from 'reactstrap';
import { toCamelCase } from '../../../utils';

const SubMenuPermission = ({ label, value, onUpdate }) => {
  const [permission, setPermission] = useState(value);
  const onHandleChange = (key) => {
    const newPermission = { ...permission, [key]: !permission[key] };
    setPermission(newPermission);
    onUpdate(label, newPermission);
  }
  return (
    <>
      <div>
        {toCamelCase(label)}
      </div>
      {
        Object.keys(value).map((key, i) => (
          <CustomInput
            className="ml-3"
            type="checkbox"
            id={`${label}.${key}`}
            checked={permission[key]}
            onChange={() => onHandleChange(key)}
            label={toCamelCase(key)}
            key={i}
          />
        ))
      }
    </>
  );
}

const MainMenuPermission = ({ label, value, defaultShow = false, onUpdate }) => {
  const [show, setShow] = useState(defaultShow);
  const [permission, setPermission] = useState(value);
  const onHandleChange = (key, value) => {
    // console.log('[onChange]', key, permissionKey);
    const newPermission = { ...permission, [key]: value };
    setPermission(newPermission);
    onUpdate(label, newPermission);
  }
  return (
    <>
      <div className="collapse-header" onClick={() => setShow(!show)}>
        <i className={`${show ? 'simple-icon-minus' : 'simple-icon-plus'}`}></i> 
        {toCamelCase(label)}
      </div>
      <Collapse className="collapse-body" isOpen={show}>
        {
          Object.keys(value).filter(key => typeof value[key] === 'object').map((key, i) => (
              <SubMenuPermission 
                label={key}
                value={permission[key]}
                key={i}
                onUpdate={onHandleChange}
                />
          ))
        }
        {
          Object.keys(value).filter(key => typeof value[key] === 'boolean').map((key, i) => (
              <CustomInput
                className="ml-3"
                type="checkbox"
                id={`${label}.${key}`}
                checked={permission[key]}
                onChange={() => onHandleChange(key, !permission[key])}
                label={toCamelCase(key)}
                key={i}
              />
          ))
        }
      </Collapse>
    </>
  );
}

const PermissionForm = ({ permission, onUpdate: onSubmit, waiting }) => {
  const [pem, setPEM] = useState(permission);
  const onUpdate = (key, value) => {
    const newPermission = { ...pem, [key]: value };
    setPEM(newPermission);
  }
  React.useEffect(() => {
    setPEM(permission);
  }, [permission]);
  return (
    <>
       <div className="permission-list">
         {Object.keys(permission).map((key, i) => (
           <MainMenuPermission 
            label={key}
            value={permission[key]}
            defaultShow={i === 0}
            onUpdate={onUpdate}
            key={i} />
         ))}
          <div className="d-flex justify-content-end align-items-center mt-3">
            <Button
              type="submit"
              color="primary"
              className={`btn-shadow btn-multiple-state ${
                waiting ? 'show-spinner' : ''
              }`}
              size="lg"
              onClick={() => onSubmit(pem)}
            >
              <span className="spinner d-inline-block">
                <span className="bounce1" />
                <span className="bounce2" />
                <span className="bounce3" />
              </span>
              <span className="label">
                Submit
              </span>
            </Button>
          </div>
        </div>
    </>
  );
}

export default PermissionForm;
