import React from 'react';
import RangeChart from './RangeChart';

type RangeProps = {
  width: number;
  height: number;
  compact?: boolean;
};

function RangeChartWithTable({ width, height }: RangeProps) {
  return (
    <>
      <RangeChart width={width} height={height}>
        {({ data, focused, onFocus }) => (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>San Francisco</th>
                  <th>New York</th>
                  <th>Austin</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr
                    key={d.date}
                    className={`${focused?.date === d.date && 'hilighted-row'}`}
                    onClick={() => onFocus(d)}
                  >
                    <td>{d.date}</td>
                    <td>{d['San Francisco']}</td>
                    <td>{d['New York']}</td>
                    <td>{d.Austin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </RangeChart>
      <style>{`
        td,
        th {
          text-align: left;
          padding: 0.5rem;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          font-size: 0.75rem;
          border-radius: 4px;
          border: 0.5px solid #dbdbdb;
        }

        table {
          display: flex;
          flex-flow: column;
          width: 100%;
          height: 250px;
        }

        thead {
          text-transform: uppercase;
          padding-right: 13px;
          flex: 0 0 auto;
        }

        tbody {
          flex: 1 1 auto;
          display: block;
          overflow-y: auto;
          overflow-x: hidden;
        }

        tr {
          width: 100%;
          display: table;
          table-layout: fixed;
          border-bottom: 0.5px solid #dbdbdb;
          cursor: pointer;
        }

        .hilighted-row {
          background-color: #d7dfe1;
        }
      `}</style>
    </>
  );
}

export default RangeChartWithTable;
