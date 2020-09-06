import React, { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardTitle,
  UncontrolledDropdown,
  DropdownItem,
  DropdownToggle,
  DropdownMenu,
} from 'reactstrap';

import IntlMessages from '../../helpers/IntlMessages';
import { LineChart } from '../../components/charts';
import { ThemeColors } from '../../helpers/ThemeColors';

import { recent7Days } from '../../utils';

const colors = ThemeColors();

const formatChartData = (data) => {
  const res = {
    labels: recent7Days(),
    datasets: [
      {
        label: 'Posts',
        data: data.posts,
        borderColor: colors.themeColor1,
        pointBackgroundColor: colors.foregroundColor,
        pointBorderColor: colors.themeColor1,
        pointHoverBackgroundColor: colors.themeColor1,
        pointHoverBorderColor: colors.foregroundColor,
        pointRadius: 6,
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        fill: false,
      },
    ],
  };
  return res;
};

const SalesChartCard = ({ stat }) => {
  const [chartData, setChartData] = useState(formatChartData(stat));

  useEffect(() => {
    setChartData(formatChartData(stat));

    return () => {
      setChartData({posts: [0,0,0,0,0,0,0]});
    }
  }, [stat]);

  return (
    <Card>
      <div className="position-absolute card-top-buttons">
        {/* <UncontrolledDropdown>
          <DropdownToggle color="" className="btn btn-header-light icon-button">
            <i className="simple-icon-refresh" />
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem>
              <IntlMessages id="dashboards.sales" />
            </DropdownItem>
            <DropdownItem>
              <IntlMessages id="dashboards.orders" />
            </DropdownItem>
            <DropdownItem>
              <IntlMessages id="dashboards.refunds" />
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown> */}
      </div>
      <CardBody>
        <CardTitle>Posts (Last 7 days)</CardTitle>
        <div className="dashboard-line-chart">
          <LineChart shadow data={chartData} />
        </div>
      </CardBody>
    </Card>
  );
};

export default SalesChartCard;
