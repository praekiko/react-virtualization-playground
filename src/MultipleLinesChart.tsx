import React, { useMemo } from 'react';
import cityTemperature, {
  CityTemperature,
} from '@visx/mock-data/lib/mocks/cityTemperature';

import CustomChartBackground from './CustomChartBackground';
import {
  AnimatedAxis,
  AnimatedLineSeries,
  lightTheme,
  Tooltip,
  XYChart,
} from '@visx/xychart';
import {
  dateScaleConfig,
  temperatureScaleConfig,
} from './MultipleLinesControls';
import { curveLinear } from 'd3-shape';
import { Group } from '@visx/group';
import { AxisScale } from '@visx/axis';
import { LinePath } from '@visx/shape';

const numTicks = 4;
export const cityTemperatureData: CityTemperature[] = cityTemperature.slice(
  225,
  375
);
const getDate = (d: CityTemperature) => d.date;
const getDateFormat = (d: CityTemperature) => new Date(d.date);
const getSfTemperature = (d: CityTemperature) => Number(d['San Francisco']);
const getNyTemperature = (d: CityTemperature) => Number(d['New York']);
const getAustinTemperature = (d: CityTemperature) => Number(d.Austin);

export type XYChartProps = {
  width: number;
  height: number;
  data: CityTemperature[];
  margin: { top: number; right: number; bottom: number; left: number };
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  hideTooltip?: boolean;
  children?: React.ReactNode;
  xScale?: AxisScale<number>;
  yScale?: AxisScale<number>;
  brushVersion?: boolean;
};

type City = 'San Francisco' | 'New York' | 'Austin';

export default function MultipleLinesChart({
  width,
  height,
  data = cityTemperatureData,
  margin,
  hideBottomAxis = false,
  hideLeftAxis = false,
  hideTooltip = false,
  children,
  xScale,
  yScale,
  brushVersion,
}: XYChartProps) {
  const config = useMemo(
    () => ({
      x: dateScaleConfig,
      y: temperatureScaleConfig,
    }),
    []
  );

  const accessors = useMemo(
    () => ({
      x: {
        'San Francisco': getDate,
        'New York': getDate,
        Austin: getDate,
      },
      y: {
        'San Francisco': getSfTemperature,
        'New York': getNyTemperature,
        Austin: getAustinTemperature,
      },
      date: getDate,
    }),
    []
  );

  if (brushVersion && xScale && yScale) {
    return (
      <svg width={width} height={height}>
        <Group left={margin.left}>
          <rect
            width={width - margin.right - margin.left}
            height={height}
            fill="#f6f6f6"
          />
          <LinePath
            data={data}
            x={(d) => xScale(getDateFormat(d)) || 0}
            y={(d) => yScale(getSfTemperature(d)) || 0}
            strokeWidth={1.5}
            stroke="#715cc6"
          />
          <LinePath
            data={data}
            x={(d) => xScale(getDateFormat(d)) || 0}
            y={(d) => yScale(getNyTemperature(d)) || 0}
            strokeWidth={1.5}
            stroke="#ffce2c"
          />
          <LinePath
            data={data}
            x={(d) => xScale(getDateFormat(d)) || 0}
            y={(d) => yScale(getAustinTemperature(d)) || 0}
            strokeWidth={1.5}
            stroke="#4a9cc1"
          />

          {children}
        </Group>
      </svg>
    );
  }

  return (
    <>
      <XYChart
        theme={lightTheme}
        xScale={config.x}
        yScale={config.y}
        height={height}
        margin={margin}
      >
        <CustomChartBackground fill={hideBottomAxis ? '#f2f2f2' : undefined} />

        <AnimatedLineSeries
          dataKey="Austin"
          data={data}
          xAccessor={accessors.x.Austin}
          yAccessor={accessors.y.Austin}
          curve={curveLinear}
        />
        <AnimatedLineSeries
          dataKey="New York"
          data={data}
          xAccessor={accessors.x['New York']}
          yAccessor={accessors.y['New York']}
          curve={curveLinear}
        />
        <AnimatedLineSeries
          dataKey="San Francisco"
          data={data}
          xAccessor={accessors.x['San Francisco']}
          yAccessor={accessors.y['San Francisco']}
          curve={curveLinear}
        />

        {!hideBottomAxis && (
          <AnimatedAxis
            key={`time-axis-min`}
            orientation={'bottom'}
            numTicks={width < 1000 ? numTicks : numTicks * 2}
            animationTrajectory={'min'}
            tickFormat={(v: Date, i: number) =>
              i === 3 ? '🌈' : i === 1 ? '✅' : `${v}`
            }
          />
        )}
        {!hideLeftAxis && (
          <AnimatedAxis
            key={`temp-axis-min`}
            label={'Temperature (°F)'}
            orientation={'left'}
            numTicks={numTicks}
            animationTrajectory={'min'}
            // values don't make sense in stream graph
            tickFormat={undefined}
          />
        )}

        {!hideTooltip && (
          <Tooltip<CityTemperature>
            showHorizontalCrosshair={false}
            showVerticalCrosshair={true}
            snapTooltipToDatumX={true}
            snapTooltipToDatumY={true}
            showDatumGlyph={true}
            showSeriesGlyphs={true}
            renderGlyph={undefined}
            renderTooltip={({ tooltipData, colorScale }) => (
              <>
                {(tooltipData?.nearestDatum?.datum &&
                  accessors.date(tooltipData?.nearestDatum?.datum)) ||
                  'No date'}
                <br />
                <br />

                {(
                  Object.keys(tooltipData?.datumByKey ?? {}).filter(
                    (city) => city
                  ) as City[]
                ).map((city) => {
                  const temperature =
                    tooltipData?.nearestDatum?.datum &&
                    accessors['y'][city](tooltipData?.nearestDatum?.datum);

                  return (
                    <div key={city}>
                      <em
                        style={{
                          color: colorScale?.(city),
                          textDecoration:
                            tooltipData?.nearestDatum?.key === city
                              ? 'underline'
                              : undefined,
                        }}
                      >
                        {city}
                      </em>{' '}
                      {temperature == null || Number.isNaN(temperature)
                        ? '–'
                        : `${temperature}° F`}
                    </div>
                  );
                })}
              </>
            )}
          />
        )}
      </XYChart>
    </>
  );
}
