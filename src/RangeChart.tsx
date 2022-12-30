import React, { ChangeEvent, useEffect, useState } from 'react';
import { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';
import MultipleLinesChart, { cityTemperatureData } from './MultipleLinesChart';
import { EventHandlerParams } from '@visx/xychart';

// accessors
const getDate = (d: CityTemperature) => new Date(d.date);

enum FilterOption {
  Last7Days = 'Last7Days',
  Last28Days = 'Last28Days',
  Last90Days = 'Last90Days',
  Year = 'Year',
  Custom = 'Custom',
}

const days = 24 * 60 * 60 * 1000;

interface ProvidedProps {
  data: CityTemperature[];
  focused?: CityTemperature;
  onFocus: (data: CityTemperature) => void;
}

type RangeProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
  children?: (props: ProvidedProps) => React.ReactNode;
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
  children,
}: RangeProps) {
  const DefaultFilterOption = compact
    ? FilterOption.Last7Days
    : FilterOption.Last90Days;

  const [focusedCityTemperature, setFocusedCityTemperature] = useState<
    CityTemperature | undefined
  >();
  const [customFilterOption, setCustomFilterOption] = useState('');
  const [filterOption, setFilterOption] = useState(DefaultFilterOption);
  const [filteredCityTemperature, setFilteredCityTemperature] =
    useState(cityTemperatureData);

  const yearsOptions = cityTemperatureData.map((d) => getDate(d).getFullYear());
  const uniqueYearsOptions = yearsOptions.filter(
    (x, i, a) => a.indexOf(x) == i
  );

  const filterDataByOption = (option: FilterOption) => {
    const lastXDate = getDate(
      cityTemperatureData[cityTemperatureData.length - 1]
    );

    let xMin: Date | undefined, xMax: Date | undefined;
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
    }

    if (option.includes(FilterOption.Year)) {
      const year = option.split('-')[1];
      xMin = new Date(`${year}-01-01T00:00:00`);
      xMax = new Date(`${year}-12-31T00:00:00`);
    }

    if (!xMax && !xMin) {
      return filteredCityTemperature;
    }

    return cityTemperatureData.filter((s) => {
      const x = getDate(s).getTime();

      return x >= xMin!.getTime() && x <= xMax!.getTime();
    });
  };

  useEffect(() => {
    setFilteredCityTemperature(filterDataByOption(filterOption));
  }, [filterOption]);

  const onFilterSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const option = event.target.value as FilterOption;
    setFilterOption(option);
    setCustomFilterOption('');
    setFocusedCityTemperature(undefined);
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
    setCustomFilterOption(
      `${zoomedOutData[0].date} - ${
        zoomedOutData[zoomedOutData.length - 1].date
      }`
    );
    setFocusedCityTemperature(undefined);
  };

  // event handlers
  const handleClearClick = () => {
    setFilteredCityTemperature(cityTemperatureData);
    setFilterOption(DefaultFilterOption);
    setFocusedCityTemperature(undefined);
    setCustomFilterOption('');
  };

  const onFocus = (data: CityTemperature) => {
    const xMin = new Date(new Date(getDate(data).getTime() - 3 * days));
    const xMax = new Date(new Date(getDate(data).getTime() + 3 * days));

    const zoomedOutData = cityTemperatureData.filter((s) => {
      const x = getDate(s).getTime();

      return x >= xMin.getTime() && x <= xMax.getTime();
    });

    setCustomFilterOption(
      `${zoomedOutData[0].date} - ${
        zoomedOutData[zoomedOutData.length - 1].date
      }`
    );
    setFilteredCityTemperature(zoomedOutData);
    setFocusedCityTemperature(data);
  };

  const onFocusOnGraph = ({ datum }: EventHandlerParams<CityTemperature>) => {
    onFocus(datum);
  };

  return (
    <div className={`${compact ? 'graph-container-sm' : 'graph-container'}`}>
      <div className="control-container">
        <select
          name="filter"
          className="filter-select-control"
          value={customFilterOption === '' ? filterOption : customFilterOption}
          onChange={onFilterSelectChange}
        >
          <option value="">
            {customFilterOption === ''
              ? '--Please choose a date range--'
              : customFilterOption}
          </option>
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
        onClickOnGraph={onFocusOnGraph}
      />

      {children &&
        children({
          data: filteredCityTemperature,
          focused: focusedCityTemperature,
          onFocus: onFocus,
        })}

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
