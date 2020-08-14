import React from 'react';

import { transformTime } from '../../utils';

const LocationItem = ({ strInfo }) => {

    const getTime = () => {
        const tArray = strInfo.split('&&');
        return transformTime(tArray[1]);
    }
    const getLocation = () => {
        const tArray = strInfo.split('&&');
        return tArray[2];
    }
    const getCoordinates = () => {
        const tArray = strInfo.split('&&');
        return tArray[0];
    }
    return (
        <div className="location-item">
            <p className="mb-2">
                <span className="glyph-icon iconsminds-stopwatch mr-1"></span>
                {getTime()}
            </p>
            <p className="font-weight-semibold">{getLocation()}</p>
            <p className="font-weight-medium">
                <span className="glyph-icon simple-icon-location-pin mr-1"></span>
                {getCoordinates()}
            </p>
        </div>
    );
}

export default LocationItem;