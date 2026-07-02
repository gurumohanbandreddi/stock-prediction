import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

const getSimulatedData = (tab, basePrice) => {
  switch (tab) {
    case '1D': return [basePrice * 0.99, basePrice * 0.995, basePrice * 0.992, basePrice * 1.005, basePrice * 0.998, basePrice * 1.002, basePrice];
    case '5D': return [basePrice * 0.95, basePrice * 0.97, basePrice * 0.96, basePrice * 1.02, basePrice];
    case '1M': return [basePrice * 0.90, basePrice * 0.95, basePrice * 0.92, basePrice * 0.98, basePrice];
    case '1Y': return [basePrice * 0.80, basePrice * 0.85, basePrice * 0.82, basePrice * 0.95, basePrice * 0.90, basePrice];
    case '5Y': return [basePrice * 0.50, basePrice * 0.60, basePrice * 0.80, basePrice * 0.75, basePrice * 0.90, basePrice];
    default: return [basePrice];
  }
};

const getLabels = (tab) => {
  switch (tab) {
    case '1D': return ['10:00', '11:00', '12:00', '1:00', '2:00', '3:00', 'Now'];
    case '5D': return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    case '1M': return ['W1', 'W2', 'W3', 'W4', 'Now'];
    case '1Y': return ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Now'];
    case '5Y': return ['2019', '2020', '2021', '2022', '2023', 'Now'];
    default: return ['Now'];
  }
};

const TodayStockCard = ({ ticker, initialPrice = 13266.20, initialChange = -77.60 }) => {
  const [activeTab, setActiveTab] = useState('1D');
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [change, setChange] = useState(initialChange);
  const [currency, setCurrency] = useState('INR');
  const [currentTimeText, setCurrentTimeText] = useState('');
  const [lastUpdatedText, setLastUpdatedText] = useState('');
  const [chartDataArray, setChartDataArray] = useState(getSimulatedData('1D', initialPrice));

  // Function to fetch real-time price from the backend
  const fetchRealPrice = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/current-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.current_price !== undefined) {
          setCurrentPrice(data.current_price);
          setChange(data.change);
          if (data.currency) setCurrency(data.currency);
          if (data.last_updated_ist) {
            // e.g. "2026-06-10 10:56:06" -> format as "10 Jun 2026, 10:56:06 AM IST"
            const parts = data.last_updated_ist.split(' ');
            if (parts.length === 2) {
              const [datePart, timePart] = parts;
              const [yr, mo, dy] = datePart.split('-');
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

              // format time to 12 hour format with AM/PM
              const [hourStr, minStr, secStr] = timePart.split(':');
              let hour = parseInt(hourStr);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              hour = hour % 12;
              hour = hour ? hour : 12; // the hour '0' should be '12'
              const formattedTime = `${hour.toString().padStart(2, '0')}:${minStr}:${secStr} ${ampm}`;

              const formattedLastUpdated = `${dy} ${months[parseInt(mo) - 1]} ${yr}, ${formattedTime} IST`;
              setLastUpdatedText(formattedLastUpdated);
            } else {
              setLastUpdatedText(data.last_updated_ist + " IST");
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch real-time price:", error);
    }
  };

  // Sync with initial props and fetch initial price
  useEffect(() => {
    setCurrentPrice(initialPrice);
    setChange(initialChange);
    setChartDataArray(getSimulatedData(activeTab, initialPrice));
    fetchRealPrice();
  }, [initialPrice, initialChange, ticker, activeTab]);

  // Live timer for current IST time (to show ticking clock)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istStr = now.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setCurrentTimeText(`${istStr} IST`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Set up polling for real price (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(fetchRealPrice, 10000);
    return () => clearInterval(interval);
  }, [ticker]);

  // Small random price ticks in-between API fetches (every 3 seconds) for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      const fluctuation = (Math.random() - 0.5) * (currentPrice * 0.0005); // 0.05% fluctuation max
      setCurrentPrice(prev => {
        const nextPrice = prev + fluctuation;
        setChange(c => c + fluctuation);
        return nextPrice;
      });
      setChartDataArray(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1] += fluctuation;
        return newArr;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  const S = {
    container: {
      backgroundColor: '#f3f4f6',
      borderRadius: '24px',
      padding: '1.5rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#111827',
      width: '100%',
      maxWidth: '320px', // Adjusted width for right sidebar
      margin: '0 auto',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    },
    header: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '0.4rem',
      marginBottom: '0.2rem',
    },
    price: {
      fontSize: '2rem',
      fontWeight: '600',
      letterSpacing: '-0.03em',
      margin: 0,
      color: '#202124'
    },
    currency: {
      fontSize: '0.85rem',
      color: '#5f6368',
      fontWeight: '500',
    },
    change: {
      fontSize: '0.9rem',
      color: change >= 0 ? '#137333' : '#d93025',
      fontWeight: '600',
      marginLeft: '0.3rem'
    },
    dateText: {
      color: '#5f6368',
      fontSize: '0.75rem',
      marginBottom: '1rem',
      lineHeight: '1.3'
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap'
    },
    tabActive: {
      backgroundColor: '#d2e3fc',
      color: '#174ea6',
      padding: '0.3rem 0.6rem',
      borderRadius: '8px',
      fontWeight: '600',
      fontSize: '0.75rem',
      border: 'none',
      cursor: 'pointer'
    },
    tabInactive: {
      backgroundColor: 'transparent',
      color: '#3c4043',
      padding: '0.3rem 0.4rem',
      fontWeight: '600',
      fontSize: '0.75rem',
      border: 'none',
      cursor: 'pointer'
    },
    chartArea: {
      height: '140px',
      width: '100%',
      position: 'relative',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      columnGap: '1rem',
      rowGap: '0.6rem',
      fontSize: '0.8rem',
      color: '#202124'
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    statLabel: {
      color: '#5f6368',
    },
    statValue: {
      fontWeight: '600',
    }
  };

  const chartData = {
    labels: getLabels(activeTab),
    datasets: [
      {
        label: 'Price',
        data: chartDataArray,
        borderColor: change >= 0 ? '#137333' : '#d93025',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 150);
          if (change >= 0) {
            gradient.addColorStop(0, 'rgba(19, 115, 51, 0.2)');
            gradient.addColorStop(1, 'rgba(19, 115, 51, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(217, 48, 37, 0.2)');
            gradient.addColorStop(1, 'rgba(217, 48, 37, 0)');
          }
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHitRadius: 10,
        tension: 0.1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    scales: {
      x: {
        display: true,
        grid: { display: false, drawBorder: false },
        ticks: { color: '#5f6368', font: { size: 10 }, maxTicksLimit: 3 }
      },
      y: {
        position: 'left',
        display: true,
        grid: { color: '#e8eaed', drawBorder: false },
        ticks: { color: '#5f6368', font: { size: 10 } }
      }
    },
    layout: { padding: 0 }
  };

  const basePriceForPct = initialPrice ? parseFloat(initialPrice) : 1;
  const pctString = change && basePriceForPct ? ((change / basePriceForPct) * 100).toFixed(2) : "0.00";
  const arrow = change >= 0 ? '▲' : '▼';

  return (
    <div style={S.container}>
      {/* Header */}
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#5f6368', marginBottom: '0.2rem' }}>{ticker || 'Company Name'}</div>
        <div style={S.header}>
          <h1 style={S.price}>{currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
          <span style={S.currency}>{currency}</span>
        </div>
      </div>
      <div style={S.dateText}>
        <div style={{ fontWeight: '600' }}>As of: {lastUpdatedText || currentTimeText}</div>
        <div style={{ color: '#137333', fontSize: '0.7rem', marginTop: '0.2rem' }}>● Live (India Standard Time)</div>
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        {['1D', '5D', '1M', '1Y', '5Y'].map(tab => (
          <button
            key={tab}
            style={activeTab === tab ? S.tabActive : S.tabInactive}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={S.chartArea}>
        <div style={{
          position: 'absolute', top: '22%', left: '25px', right: '10px',
          borderTop: '1px dashed #9aa0a6', zIndex: 0
        }}></div>
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e8eaed', marginBottom: '1rem' }} />

      {/* Stats Grid */}
      <div style={S.statsGrid}>
        <div style={S.statRow}><span style={S.statLabel}>Open</span><span style={S.statValue}>13,250.00</span></div>
        <div style={S.statRow}><span style={S.statLabel}>Vol</span><span style={S.statValue}>8.22 K</span></div>
        <div style={S.statRow}><span style={S.statLabel}>High</span><span style={S.statValue}>13,349.00</span></div>
        <div style={S.statRow}><span style={S.statLabel}>Avg Vol</span><span style={S.statValue}>617.3K</span></div>
        <div style={S.statRow}><span style={S.statLabel}>Low</span><span style={S.statValue}>13,122.10</span></div>
        <div style={S.statRow}><span style={S.statLabel}>52wk H</span><span style={S.statValue}>17,371.60</span></div>
        <div style={S.statRow}><span style={S.statLabel}>Mkt Cap</span><span style={S.statValue}>5.16 T</span></div>
        <div style={S.statRow}><span style={S.statLabel}>52wk L</span><span style={S.statValue}>11,332.05</span></div>
      </div>
    </div>
  );
};

export default TodayStockCard;
