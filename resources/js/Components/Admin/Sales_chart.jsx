import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SalesChart = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [year, setYear] = useState(2025); // Current year
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:8000/api/chart/revenue/${year}`)
            .then(response => {
                const data = response.data;
                const labels = data.map(item => `Month ${item.month}`);
                const revenues = data.map(item => item.total_revenue);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Revenue (VND)',
                            data: revenues,
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            fill: true,
                            tension: 0.1,
                        },
                    ],
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setLoading(false);
            });
    }, [year]);

    const handleYearChange = (e) => {
        setYear(parseInt(e.target.value));
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h2>Sales in {year}</h2>
            <div>
                <label>Select year: </label>
                <select value={year} onChange={handleYearChange}>
                    {[2023, 2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            <Line
                data={chartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: `Sales in ${year}` },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Revenue (VND)' }
                        },
                    },
                }}
            />
        </div>
    );
};

export default SalesChart;
