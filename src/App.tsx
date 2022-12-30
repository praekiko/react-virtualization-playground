import React from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import MultipleLinesChartWithControls from './MultipleLinesChartWithControls';
import BrushChart from './BrushChart';
import RangeChart from './RangeChart';
import RangeChartWithTable from './RangeChartWithTable';

function App() {
  return (
    <div className="app-container">
      <ParentSize>
        {({ width, height }) => (
          <>
            <h1>🎉 Graph & Table</h1>
            <RangeChartWithTable width={width} height={400} />

            <h1>🔎 Zoom</h1>
            <h2>Zoom by date range version</h2>
            <RangeChart width={width} height={400} />
            <h2>Brush version</h2>
            <BrushChart width={width} height={400} />

            <h1>📐 Responsive layout</h1>
            <div className="wrapper">
              <div className="one">
                <BrushChart width={width / 2} height={380} />
              </div>
              <div className="two">
                <RangeChart compact width={width / 2} height={150} />
              </div>
              <div className="three">
                <BrushChart compact width={width / 2} height={150} />
              </div>
            </div>

            <h1>🌈 Playground</h1>
            <h2>Line graphs with controls</h2>
            <MultipleLinesChartWithControls width={width} height={height} />

            <style>{`
              .wrapper {
                width: 100%;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                overflow-x: hidden;
                grid-gap: 1rem;
              }
              .one {
                grid-column: 1;
                grid-row: 1 / 3;
              }
              .two {
                grid-column: 2;
                grid-row: 1 / 2;
              }
              .three {
                grid-column: 2;
                grid-row: 2 / 3;
              }

              .graph-container {
                background-color: #fff;
                border-radius: 1rem;
                padding: 2rem;
              }

              .graph-container-sm {
                background-color: #fff;
                border-radius: 1rem;
                padding: 2rem 1rem;
              }

              .controls {
                padding: 2rem;
              }

              .app-container {
                padding: 2rem 12rem;
                background-color: #fafafa;
              }
            `}</style>
          </>
        )}
      </ParentSize>
    </div>
  );
}

export default App;
