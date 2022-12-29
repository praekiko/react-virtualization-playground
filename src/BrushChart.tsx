import React, { useRef, useState, useMemo } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush, {
  BaseBrushState,
  UpdateBrush,
} from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { Group } from '@visx/group';
import { max, extent } from 'd3-array';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import MultipleLinesChart, { cityTemperatureData } from './MultipleLinesChart';
import { CityTemperature } from '@visx/mock-data/lib/mocks/cityTemperature';

// Initialize some variables
const brushMargin = { top: 10, bottom: 20, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = 'brush_pattern';
export const accentColor = '#f6acc8';
export const background = '#584153';
export const background2 = '#af8baf';
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: 'white',
};

// accessors
const getDate = (d: CityTemperature) => new Date(d.date);
const getSfTemperature = (d: CityTemperature) => Number(d['San Francisco']);
const getNyTemperature = (d: CityTemperature) => Number(d['New York']);
const getAustinTemperature = (d: CityTemperature) => Number(d.Austin);

export type BrushProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
};

function BrushChart({
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
  const brushRef = useRef<BaseBrush | null>(null);
  const [filteredCityTemperature, setFilteredCityTemperature] =
    useState(cityTemperatureData);

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;

    const cityTemperatureCopy = cityTemperatureData.filter((s) => {
      const x = getDate(s).getTime();
      const sfy = getSfTemperature(s);
      // const nyy = getNyTemperature(s);
      // const auy = getAustinTemperature(s);
      return (
        x > x0 && x < x1 && sfy > y0 && sfy < y1
        // &&
        // nyy > y0 &&
        // nyy < y1 &&
        // auy > y0 &&
        // auy < y1
      );
    });
    setFilteredCityTemperature(cityTemperatureCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(
    bottomChartHeight - brushMargin.top - brushMargin.bottom,
    0
  );

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredCityTemperature, getDate) as [Date, Date],
      }),
    [xMax, filteredCityTemperature]
  );
  const temperatureScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [
          0,
          Math.max(
            max(filteredCityTemperature, getSfTemperature) || 0,
            max(filteredCityTemperature, getNyTemperature) || 0,
            max(filteredCityTemperature, getAustinTemperature) || 0
          ),
        ],
        nice: true,
      }),
    [yMax, filteredCityTemperature]
  );
  const brushDateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain: extent(cityTemperatureData, getDate) as [Date, Date],
      }),
    [xBrushMax]
  );
  const brushTemperatureScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [
          0,
          Math.max(
            max(filteredCityTemperature, getSfTemperature) || 0,
            max(filteredCityTemperature, getNyTemperature) || 0,
            max(filteredCityTemperature, getAustinTemperature) || 0
          ),
        ],
        nice: true,
      }),
    [yBrushMax]
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: {
        x: brushDateScale(
          getDate(cityTemperatureData[cityTemperatureData.length - 10])
        ),
      },
      end: {
        x: brushDateScale(
          getDate(cityTemperatureData[cityTemperatureData.length - 1])
        ),
      },
    }),
    [brushDateScale]
  );

  // event handlers
  const handleClearClick = () => {
    if (brushRef?.current) {
      setFilteredCityTemperature(cityTemperatureData);
      brushRef.current.reset();
    }
  };

  const handleResetClick = () => {
    if (brushRef?.current) {
      const updater: UpdateBrush = (prevBrush) => {
        const newExtent = brushRef.current!.getExtent(
          initialBrushPosition.start,
          initialBrushPosition.end
        );

        const newState: BaseBrushState = {
          ...prevBrush,
          start: { y: newExtent.y0, x: newExtent.x0 },
          end: { y: newExtent.y1, x: newExtent.x1 },
          extent: newExtent,
        };

        return newState;
      };
      brushRef.current.updateBrush(updater);
    }
  };

  return (
    <div>
      {height >= 300 && (
        <div className="control-container">
          <button className="control-btn" onClick={handleClearClick}>
            Clear
          </button>
          &nbsp;
          <button className="control-btn" onClick={handleResetClick}>
            Reset
          </button>
        </div>
      )}
      <MultipleLinesChart
        hideBottomAxis={compact}
        data={filteredCityTemperature}
        width={width}
        height={height - yBrushMax}
        margin={{ ...margin, bottom: topChartBottomMargin }}
      />
      {height >= 300 && (
        <>
          <MultipleLinesChart
            hideBottomAxis
            hideLeftAxis
            hideTooltip
            brushVersion
            data={cityTemperatureData}
            width={width}
            height={yBrushMax}
            margin={brushMargin}
            xScale={brushDateScale}
            yScale={brushTemperatureScale}
          >
            <PatternLines
              id={PATTERN_ID}
              height={8}
              width={8}
              stroke={accentColor}
              strokeWidth={1}
              orientation={['diagonal']}
            />
            <Brush
              xScale={brushDateScale}
              yScale={brushTemperatureScale}
              width={xBrushMax}
              height={yBrushMax}
              margin={brushMargin}
              handleSize={8}
              innerRef={brushRef}
              resizeTriggerAreas={['left', 'right']}
              brushDirection="horizontal"
              initialBrushPosition={initialBrushPosition}
              onChange={onBrushChange}
              onClick={() => setFilteredCityTemperature(cityTemperatureData)}
              selectedBoxStyle={selectedBrushStyle}
              useWindowMoveEvents
              renderBrushHandle={(props) => <BrushHandle {...props} />}
            />
          </MultipleLinesChart>
        </>
      )}

      <style>{`
        .control-container {
          text-align: right;
        }

        .control-btn {
          color: #888;
          padding: 4px 8px;
        }
      `}</style>
    </div>
  );
}
// We need to manually offset the handles for them to be rendered at the right position
function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
  const pathWidth = 8;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        fill="#f2f2f2"
        d="M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12"
        stroke="#999999"
        strokeWidth="1"
        style={{ cursor: 'ew-resize' }}
      />
    </Group>
  );
}

export default BrushChart;
