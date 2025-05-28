import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PowerChart = () => {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [year, setYear] = useState(2025); // Current year
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://localhost:8000/api/chart/bookings-ratio/${year}`)
            .then(response => {
                const data = response.data;
                const labels = data.map(item => `Month ${item.month}`);
                const ratios = data.map(item => item.ratio);

                setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Booking Ratio (%)',
                            data: ratios,
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                                'rgba(255, 99, 132, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                                'rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
                                'rgba(255, 99, 132, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
                                'rgba(255, 99, 132, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                                'rgba(75, 192, 192, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)',
                                'rgba(255, 99, 132, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                            ],
                            borderWidth: 1,
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
            <h2>Booking Ratio in {year}</h2>
            <div>
                <label>Select year: </label>
                <select value={year} onChange={handleYearChange}>
                    {[2023, 2024, 2025, 2026].map(y => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: `Booking Ratio in ${year}` },
                    },
                    scales: {
                        y: { beginAtZero: true, max: 100, title: { display: true, text: 'Ratio (%)' } },
                    },
                }}
            />
        </div>
    );
};

export default PowerChart;
