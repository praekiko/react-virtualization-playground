import React, { useMemo, useState } from 'react';
import cityTemperature, {
  CityTemperature,
} from '@visx/mock-data/lib/mocks/cityTemperature';

import CustomChartBackground from './CustomChartBackground';
import {
  AnimatedAxis,
  AnimatedLineSeries,
  Annotation,
  AnnotationCircleSubject,
  AnnotationConnector,
  AnnotationLabel,
  EventHandlerParams,
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

const numTicks = 5;
export const cityTemperatureData: CityTemperature[] = cityTemperature.slice(
  225,
  375
);
const getDate = (d: CityTemperature) => d.date;
const getDateFormat = (d: CityTemperature) => new Date(d.date);
const getSfTemperature = (d: CityTemperature) => Number(d['San Francisco']);
const getNyTemperature = (d: CityTemperature) => Number(d['New York']);
const getAustinTemperature = (d: CityTemperature) => Number(d.Austin);

type Accessor = (d: CityTemperature) => number | string;

interface Accessors {
  'San Francisco': Accessor;
  'New York': Accessor;
  Austin: Accessor;
}

type DataKey = keyof Accessors;

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
  onClickOnGraph?: (data: EventHandlerParams<CityTemperature>) => void;
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
  onClickOnGraph,
}: XYChartProps) {
  const defaultAnnotationDataIndex = 13;

  const [annotationDataIndex, setAnnotationDataIndex] = useState(
    defaultAnnotationDataIndex
  );
  const [annotationDataKey, setAnnotationDataKey] = useState<DataKey | null>(
    null
  );

  const [annotationLabelPosition, setAnnotationLabelPosition] = useState({
    dx: -40,
    dy: -20,
  });

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
    const widthAfterMargin = Math.max(width - margin.right - margin.left, 0);
    return (
      <svg width={widthAfterMargin} height={height}>
        <Group left={margin.left}>
          <rect
            width={widthAfterMargin}
            height={height}
            stroke="#e4e4e4"
            fill="#f6f6f6"
          />
          <LinePath
            data={data}
            x={(d) => xScale(getDateFormat(d)) || 0}
            y={(d) => yScale(getSfTemperature(d)) || 0}
            strokeWidth={1.5}
            stroke="rgba(255,231,143,0.8)"
          />
          <LinePath
            data={data}
            x={(d) => xScale(getDateFormat(d)) || 0}
            y={(d) => yScale(getNyTemperature(d)) || 0}
            strokeWidth={1.5}
            stroke="#6a097d"
          />
          <LinePath
            data={data}
            x={(d) => xScale(getDateFormat(d)) || 0}
            y={(d) => yScale(getAustinTemperature(d)) || 0}
            strokeWidth={1.5}
            stroke="#d6e0f0"
          />

          {children}
        </Group>
      </svg>
    );
  }

  return (
    <XYChart
      theme={lightTheme}
      xScale={config.x}
      yScale={config.y}
      height={height}
      onPointerUp={(d: EventHandlerParams<CityTemperature>) => {
        setAnnotationDataKey(d.key as 'New York' | 'San Francisco' | 'Austin');
        setAnnotationDataIndex(d.index);
        onClickOnGraph && onClickOnGraph(d);
      }}
    >
      <CustomChartBackground />

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
          numTicks={width < 1500 ? numTicks : numTicks * 2}
          animationTrajectory={'min'}
          tickFormat={(v: Date, i: number) =>
            i === 3 ? '🌈' : i === 1 ? '✅' : `${v}`
          }
          // rangePadding={{ start: margin.left, end: margin.right }}
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

      {annotationDataKey && data[annotationDataIndex] && (
        <Annotation
          dataKey={annotationDataKey}
          datum={data[annotationDataIndex]}
          dx={annotationLabelPosition.dx}
          dy={annotationLabelPosition.dy}
          canEditSubject={false}
          onDragEnd={({ dx, dy }) => setAnnotationLabelPosition({ dx, dy })}
        >
          <AnnotationConnector />
          <AnnotationCircleSubject />
          <AnnotationLabel
            title={annotationDataKey}
            subtitle={`${data[annotationDataIndex].date}, ${data[annotationDataIndex][annotationDataKey]}°F`}
            width={135}
            backgroundProps={{
              stroke: lightTheme.gridStyles.stroke,
              strokeOpacity: 0.5,
              fillOpacity: 0.8,
            }}
          />
        </Annotation>
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
  );
}
