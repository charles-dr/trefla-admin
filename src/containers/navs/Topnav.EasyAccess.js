import React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import IntlMessages from '../../helpers/IntlMessages';

const TopnavEasyAccess = () => {
  return (
    <div className="position-relative d-none d-sm-inline-block">
      <UncontrolledDropdown className="dropdown-menu-right">
        <DropdownToggle className="header-icon" color="empty">
          <i className="simple-icon-grid" />
        </DropdownToggle>
        <DropdownMenu
          className="position-absolute mt-3"
          right
          id="iconMenuDropdown"
        >
          <NavLink to="/app/dashboard" className="icon-menu-item">
            <i className="iconsminds-dashboard d-block" />{' '}
            <IntlMessages id="menu.dashboard" />
          </NavLink>

          <NavLink to="/app/user" className="icon-menu-item">
            <i className="simple-icon-people d-block" />{' '}
            <IntlMessages id="menu.users" />
          </NavLink>
          <NavLink to="/app/post" className="icon-menu-item">
            <i className="simple-icon-paper-plane d-block" />{' '}
            <IntlMessages id="menu.posts" />
          </NavLink>
          <NavLink to="#" className="icon-menu-item">
            <i className="simple-icon-globe d-block" />{' '}
            <IntlMessages id="menu.languages" />
          </NavLink>
          <NavLink to="/app/settings/profile" className="icon-menu-item">
            <i className="iconsminds-profile d-block" />{' '}
            <IntlMessages id="menu.profile" />
          </NavLink>
          <NavLink to="/app/settings/password" className="icon-menu-item">
            <i className="iconsminds-key-lock d-block" />{' '}
            <IntlMessages id="menu.password" />
          </NavLink>
        </DropdownMenu>
      </UncontrolledDropdown>
    </div>
  );
};

export default TopnavEasyAccess;
