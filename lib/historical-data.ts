// Данные за 2006–2025. Приблизительные значения по данным Росстата, MOEX (MCFTR / RGBITR).
// Используются в разделе "Данные за 20 лет" как справочная информация.

export interface YearData {
  year: number;
  inflation: number;   // %
  stocks: number;      // % годовых, MCFTR
  bonds: number;       // % годовых, RGBITR
}

export const HISTORICAL_DATA: YearData[] = [
  { year: 2006, inflation: 9.0,  stocks: 67.5,  bonds: 6.8 },
  { year: 2007, inflation: 11.9, stocks: 22.7,  bonds: 7.0 },
  { year: 2008, inflation: 13.3, stocks: -67.2, bonds: -5.7 },
  { year: 2009, inflation: 8.8,  stocks: 128.4, bonds: 25.5 },
  { year: 2010, inflation: 8.8,  stocks: 22.4,  bonds: 12.7 },
  { year: 2011, inflation: 6.1,  stocks: -16.2, bonds: 6.2 },
  { year: 2012, inflation: 6.6,  stocks: 7.6,   bonds: 9.2 },
  { year: 2013, inflation: 6.5,  stocks: 2.0,   bonds: 4.9 },
  { year: 2014, inflation: 11.4, stocks: -2.6,  bonds: 12.6 },
  { year: 2015, inflation: 12.9, stocks: 26.1,  bonds: 12.4 },
  { year: 2016, inflation: 5.4,  stocks: 26.8,  bonds: 12.7 },
  { year: 2017, inflation: 2.5,  stocks: 5.6,   bonds: 11.9 },
  { year: 2018, inflation: 4.3,  stocks: 12.3,  bonds: 3.4 },
  { year: 2019, inflation: 3.0,  stocks: 28.6,  bonds: 16.5 },
  { year: 2020, inflation: 4.9,  stocks: 8.0,   bonds: 8.6 },
  { year: 2021, inflation: 8.4,  stocks: 19.6,  bonds: 1.2 },
  { year: 2022, inflation: 11.9, stocks: -43.2, bonds: -1.0 },
  { year: 2023, inflation: 7.4,  stocks: 48.9,  bonds: 9.3 },
  { year: 2024, inflation: 9.5,  stocks: 18.0,  bonds: 10.0 },
  { year: 2025, inflation: 8.7,  stocks: 5.0,   bonds: 5.0 },
];

export const AVG = {
  inflation: +(HISTORICAL_DATA.reduce((s, d) => s + d.inflation, 0) / HISTORICAL_DATA.length).toFixed(2),
  stocks: +(HISTORICAL_DATA.reduce((s, d) => s + d.stocks, 0) / HISTORICAL_DATA.length).toFixed(2),
  bonds: +(HISTORICAL_DATA.reduce((s, d) => s + d.bonds, 0) / HISTORICAL_DATA.length).toFixed(2),
};

export const MEDIAN = {
  inflation: 7.4,
  stocks: 18.0,
  bonds: 9.25,
};