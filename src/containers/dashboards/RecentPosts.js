/* eslint-disable react/no-array-index-key */
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { Card, CardBody, CardTitle, Badge } from 'reactstrap';

import IntlMessages from '../../helpers/IntlMessages';
// import data from '../../data/products';

const data = [
  {
    id: 1,
    title: 'Marble Cake',
    img: '/assets/img/marble-cake-thumb.jpg',
    category: 'Cakes',
    createDate: '02.04.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description: 'Wedding cake with flowers Macarons and blueberries',
    sales: 1647,
    stock: 62,
  },
  {
    id: 2,
    title: 'Fat Rascal',
    category: 'Cupcakes',
    img: '/assets/img/fat-rascal-thumb.jpg',
    createDate: '01.04.2018',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Cheesecake with chocolate cookies and Cream biscuits',
    sales: 1240,
    stock: 48,
  },
  {
    id: 3,
    title: 'Chocolate Cake',
    img: '/assets/img/chocolate-cake-thumb.jpg',
    category: 'Cakes',
    createDate: '25.03.2018',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Homemade cheesecake with fresh berries and mint',
    sales: 1080,
    stock: 57,
  },
  {
    id: 4,
    title: 'Goose Breast',
    img: '/assets/img/goose-breast-thumb.jpg',
    category: 'Cakes',
    createDate: '21.03.2018',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Chocolate cake with berries',
    sales: 1014,
    stock: 41,
  },
  {
    id: 5,
    title: 'Petit Gâteau',
    category: 'Cupcakes',
    img: '/assets/img/petit-gateau-thumb.jpg',
    createDate: '02.06.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description: 'Chocolate cake with mascarpone',
    sales: 985,
    stock: 23,
  },
  {
    id: 6,
    title: 'Salzburger Nockerl',
    img: '/assets/img/salzburger-nockerl-thumb.jpg',
    category: 'Desserts',
    createDate: '14.07.2018',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Wedding cake decorated with donuts and wild berries',
    sales: 962,
    stock: 34,
  },
  {
    id: 7,
    title: 'Napoleonshat',
    img: '/assets/img/napoleonshat-thumb.jpg',
    category: 'Desserts',
    createDate: '05.02.2018',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Cheesecake with fresh berries and mint for dessert',
    sales: 921,
    stock: 31,
  },
  {
    id: 8,
    title: 'Cheesecake',
    img: '/assets/img/cheesecake-thumb.jpg',
    category: 'Cakes',
    createDate: '18.08.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description: 'Delicious vegan chocolate cake',
    sales: 887,
    stock: 21,
  },
  {
    id: 9,
    title: 'Financier',
    img: '/assets/img/financier-thumb.jpg',
    category: 'Cakes',
    createDate: '15.03.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description:
      'White chocolate strawberry yogurt cake decorated with fresh fruits and chocolate',
    sales: 865,
    stock: 53,
  },
  {
    id: 10,
    title: 'Genoise',
    img: '/assets/img/genoise-thumb.jpg',
    category: 'Cupcakes',
    createDate: '11.06.2018',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Christmas fruit cake, pudding on top',
    sales: 824,
    stock: 55,
  },
  {
    id: 11,
    title: 'Gingerbread',
    img: '/assets/img/gingerbread-thumb.jpg',
    category: 'Cakes',
    createDate: '10.04.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description: 'Wedding cake decorated with donuts and wild berries',
    sales: 714,
    stock: 12,
  },
  {
    id: 12,
    title: 'Magdalena',
    img: '/assets/img/magdalena-thumb.jpg',
    category: 'Cakes',
    createDate: '22.07.2018',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Christmas fruit cake, pudding on top',
    sales: 702,
    stock: 14,
  },
  {
    id: 13,
    title: 'Parkin',
    img: '/assets/img/parkin-thumb.jpg',
    category: 'Cakes',
    createDate: '22.08.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description:
      'White chocolate strawberry yogurt cake decorated with fresh fruits and chocolate',
    sales: 689,
    stock: 78,
  },
  {
    id: 14,
    title: 'Streuselkuchen',
    img: '/assets/img/streuselkuchen-thumb.jpg',
    category: 'Cakes',
    createDate: '22.07.2018',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Delicious vegan chocolate cake',
    sales: 645,
    stock: 55,
  },
  {
    id: 15,
    title: 'Tea loaf',
    img: '/assets/img/tea-loaf-thumb.jpg',
    category: 'Cakes',
    createDate: '10.09.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description: 'Cheesecake with fresh berries and mint for dessert',
    sales: 632,
    stock: 20,
  },
  {
    id: 16,
    title: 'Merveilleux',
    img: '/assets/img/merveilleux-thumb.jpg',
    category: 'Cakes',
    createDate: '18.02.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description: 'Chocolate cake with mascarpone',
    sales: 621,
    stock: 6,
  },
  {
    id: 17,
    title: 'Fruitcake',
    img: '/assets/img/fruitcake-thumb.jpg',
    category: 'Cakes',
    createDate: '12.01.2019',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Chocolate cake with berries',
    sales: 595,
    stock: 17,
  },
  {
    id: 18,
    title: 'Bebinca',
    img: '/assets/img/bebinca-thumb.jpg',
    category: 'Cakes',
    createDate: '04.02.2019',
    status: 'PROCESSED',
    statusColor: 'secondary',
    description: 'Homemade cheesecake with fresh berries and mint',
    sales: 574,
    stock: 16,
  },
  {
    id: 19,
    title: 'Cremeschnitte',
    img: '/assets/img/cremeschnitte-thumb.jpg',
    category: 'Desserts',
    createDate: '04.03.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description: 'Cheesecake with chocolate cookies and Cream biscuits',
    sales: 562,
    stock: 9,
  },
  {
    id: 20,
    title: 'Soufflé',
    img: '/assets/img/souffle-thumb.jpg',
    category: 'Cupcakes',
    createDate: '16.01.2018',
    status: 'ON HOLD',
    statusColor: 'primary',
    description: 'Wedding cake with flowers Macarons and blueberries',
    sales: 524,
    stock: 14,
  },
];

const RecentPosts = ({ posts }) => {
  return (
    <Card>
      <div className="position-absolute card-top-buttons">
        <button type="button" className="btn btn-header-light icon-button">
          <i className="simple-icon-refresh" />
        </button>
      </div>
      <CardBody>
        <CardTitle>
          <IntlMessages id="pages.recent-posts" />
        </CardTitle>
        <div className="scroll dashboard-list-with-thumbs">
          <PerfectScrollbar
            options={{ suppressScrollX: true, wheelPropagation: false }}
          >
            {posts.slice(0, 6).map((order, index) => {
              return (
                <div key={index} className="d-flex flex-row mb-3">
                  <NavLink
                    to={order.user_profile_link}
                    className="d-block position-relative"
                  >
                    <img
                      src={order.img}
                      alt={order.title}
                      className="list-thumbnail border-0"
                    />
                    {/* <Badge
                      key={index}
                      className="position-absolute badge-top-right"
                      color={order.statusColor}
                      pill
                    >
                      {order.status}
                    </Badge> */}
                  </NavLink>

                  <div className="pl-3 pt-2 pr-2 pb-2">
                    <NavLink to={order.post_link}>
                      <p className="list-item-heading">{order.title}</p>
                      <div className="pr-4">
                        <p className="text-muted mb-1 text-small">
                          {order.description}
                        </p>
                      </div>
                      <div className="text-primary text-small font-weight-medium d-none d-sm-block">
                        {order.createDate}
                      </div>
                    </NavLink>
                  </div>
                </div>
              );
            })}
          </PerfectScrollbar>
        </div>
      </CardBody>
    </Card>
  );
};
export default RecentPosts;
