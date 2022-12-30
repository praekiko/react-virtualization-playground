import React, { ChangeEvent, useEffect, useState } from 'react';
import { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';
import MultipleLinesChart, { cityTemperatureData } from './MultipleLinesChart';

// accessors
const getDate = (d: CityTemperature) => new Date(d.date);

enum FilterOption {
  Last7Days = 'Last7Days',
  Last28Days = 'Last28Days',
  Last90Days = 'Last90Days',
  Year = 'Year',
  Custom = 'Custom',
}

const DefaultFilterOption = FilterOption.Last90Days;
const days = 24 * 60 * 60 * 1000;

export type BrushProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
};

function RangeChart({
  compact = false,
  width,
  height,
  margin = {
    top: 20,
    left: 50,
    bottom: 20,
    right: 20,
  },
}: BrushProps) {
  const [filterOption, setFilterOption] = useState(DefaultFilterOption);
  const [filteredCityTemperature, setFilteredCityTemperature] =
    useState(cityTemperatureData);

  const yearsOptions = cityTemperatureData.map((d) => getDate(d).getFullYear());
  const uniqueYearsOptions = yearsOptions.filter(
    (x, i, a) => a.indexOf(x) == i
  );

  const filterDataByOption = (option: FilterOption) => {
    const firstXDate = getDate(cityTemperatureData[0]);
    const lastXDate = getDate(
      cityTemperatureData[cityTemperatureData.length - 1]
    );

    let xMin = firstXDate;
    let xMax = lastXDate;
    switch (option) {
      case FilterOption.Last7Days:
        xMin = new Date(new Date(lastXDate.getTime() - 7 * days));
        xMax = lastXDate;
        break;
      case FilterOption.Last28Days:
        xMin = new Date(new Date(lastXDate.getTime() - 28 * days));
        xMax = lastXDate;
        break;
      case FilterOption.Last90Days:
        xMin = new Date(new Date(lastXDate.getTime() - 90 * days));
        xMax = lastXDate;
        break;
      case FilterOption.Year:
        // eslint-disable-next-line no-case-declarations
        const year = option.split('-')[1];
        xMin = new Date(`${year}-01-01T00:00:00`);
        xMax = new Date(`${year}2022-12-31T00:00:00`);
        break;
      default:
        xMin = firstXDate;
        xMax = lastXDate;
        break;
    }

    return cityTemperatureData.filter((s) => {
      const x = getDate(s).getTime();

      return x >= xMin.getTime() && x <= xMax.getTime();
    });
  };

  useEffect(() => {
    setFilteredCityTemperature(filterDataByOption(filterOption));
  }, [filterOption]);

  const onFilterSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const option = event.target.value as FilterOption;
    setFilterOption(option);
  };

  const onZoomOut = () => {
    const firstXDate = getDate(filteredCityTemperature[0]);
    const lastXDate = getDate(
      filteredCityTemperature[filteredCityTemperature.length - 1]
    );

    const xMin = new Date(new Date(firstXDate.getTime() - 2 * days));
    const xMax = new Date(new Date(lastXDate.getTime() + 2 * days));

    const zoomedOutData = cityTemperatureData.filter((s) => {
      const x = getDate(s).getTime();

      return x >= xMin.getTime() && x <= xMax.getTime();
    });

    setFilteredCityTemperature(zoomedOutData);
  };

  // event handlers
  const handleClearClick = () => {
    setFilteredCityTemperature(cityTemperatureData);
    setFilterOption(DefaultFilterOption);
  };

  return (
    <div className={`${compact ? 'graph-container-sm' : 'graph-container'}`}>
      <div className="control-container">
        <select
          name="filter"
          className="filter-select-control"
          value={filterOption}
          onChange={onFilterSelectChange}
        >
          <option value="">--Please choose a date range--</option>
          <option value={FilterOption.Last7Days}>Last 7 days</option>
          <option value={FilterOption.Last28Days}>Last 28 days</option>
          <option value={FilterOption.Last90Days}>Last 90 days</option>
          {uniqueYearsOptions.map((y) => (
            <option key={y} value={`${FilterOption.Year}-${y}`}>
              {y}
            </option>
          ))}

          <option value={FilterOption.Custom}>Custom</option>
        </select>
        <button className="control-btn" onClick={onZoomOut}>
          -
        </button>
        &nbsp;
        <button className="control-btn" onClick={handleClearClick}>
          Clear
        </button>
        &nbsp;
      </div>
      <MultipleLinesChart
        data={filteredCityTemperature}
        width={width}
        height={height}
        margin={margin}
      />

      <style>{`
        .filter-select-control {
          color: #888;
          padding: 4px 8px;
          margin-right: 4px;
        }
      `}</style>
    </div>
  );
}

export default RangeChart;
