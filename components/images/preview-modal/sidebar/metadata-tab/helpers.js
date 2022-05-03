import React from 'react';

import MetadataItem from './item';

const getRelevantExif = (rawExif) => {
  const relevantKeys = {
    fileType: 'Format',
    imageSize: 'Dimensions',
    profileDescription: 'Profile',
    aperture: 'Aperture',
    // Special case: see below
    exposureTime: 'Exposure',
    iso: 'ISO',
    // Special case: see below
    ambientTemperature: 'Temperature',
  };

  return rawExif
    .filter(e => relevantKeys[e.exifTag.tagName])
    .map((e) => {
      const { tagName } = e.exifTag;

      let content = e.value;
      if (tagName === 'exposureTime') {
        content = `${content} (s)`;
      } else if (tagName === 'ambientTemperature') {
        const fTemp = rawExif.find(item => item.exifTag.tagName === 'ambientTemperatureFahrenheit');
        content = `${content} (°C)${fTemp ? ` / ${fTemp.value} (°F)` : ''}`;
      }

      return (
        <MetadataItem key={relevantKeys[tagName]} label={relevantKeys[tagName]}>
          {content}
        </MetadataItem>
      );
    });
};

export { getRelevantExif };
export default getRelevantExif;
