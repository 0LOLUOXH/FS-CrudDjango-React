import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DatePicker, Card, Row, Col, Select, Spin, Alert, Empty } from 'antd';
import moment from 'moment';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const { RangePicker } = DatePicker;
const { Option } = Select;

const cardStyle = {
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  marginBottom: '20px'
};

const Inicio = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([moment().subtract(1, 'month'), moment()]);
  const [timeRange, setTimeRange] = useState('month');
  const [topProducts, setTopProducts] = useState([]);
  const [topPurchased, setTopPurchased] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [topStock, setTopStock] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [purchaseTrend, setPurchaseTrend] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [startDate, endDate] = dateRange;
      const params = {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
        time_range: timeRange
      };

      const [
        topProductsRes,
        topPurchasedRes,
        topClientsRes,
        topStockRes,
        salesTrendRes,
        purchaseTrendRes
      ] = await Promise.all([
        axios.get('/fs/dashboard/top-products/', { params }),
        axios.get('/fs/dashboard/top-purchased/', { params }),
        axios.get('/fs/dashboard/top-clients/', { params }),
        axios.get('/fs/dashboard/top-stock/'),
        axios.get('/fs/dashboard/sales-trend/', { params }),
        axios.get('/fs/dashboard/purchase-trend/', { params })
      ]);

      setTopProducts(topProductsRes?.data?.data || []);
      setTopPurchased(topPurchasedRes?.data?.data || []);
      setTopClients(topClientsRes?.data?.data || []);
      setTopStock(topStockRes?.data?.data || []);
      setSalesTrend(salesTrendRes?.data?.data || []);
      setPurchaseTrend(purchaseTrendRes?.data?.data || []);
    } catch (err) {
      setError('Error al cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, timeRange]);

  const handleDateChange = (dates) => {
    if (dates && dates.length === 2) setDateRange(dates);
  };

  const handleTimeRangeChange = (value) => setTimeRange(value);

  const barData = (data, labelKey, valueKey) => {
    if (!data || !Array.isArray(data)) {
      return {
        labels: [],
        datasets: [{
          label: 'Cantidad',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      };
    }
    return {
      labels: data.map(item => item?.[labelKey] || ''),
      datasets: [{
        label: 'Cantidad',
        data: data.map(item => item?.[valueKey] || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    };
  };

  const lineData = (data) => {
    if (!data || !Array.isArray(data)) {
      return {
        labels: [],
        datasets: []
      };
    }
    return {
      labels: data.map(item => item?.period || ''),
      datasets: [{
        label: 'Total',
        data: data.map(item => item?.total || 0),
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)'
      }]
    };
  };

  const renderChart = (type, data, config) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return <Empty description="No hay datos para mostrar" style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }} />;
    }
    return type === 'line' ? <Line data={config} /> : <Bar data={config} />;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>Dashboard de Análisis</h1>

      <Card style={cardStyle}>
        <Row gutter={16}>
          <Col span={12}>
            <div>Rango de fechas:</div>
            <RangePicker value={dateRange} onChange={handleDateChange} style={{ width: '100%' }} />
          </Col>
          <Col span={12}>
            <div>Agrupación:</div>
            <Select value={timeRange} onChange={handleTimeRangeChange} style={{ width: '100%' }}>
              <Option value="day">Diario</Option>
              <Option value="week">Semanal</Option>
              <Option value="month">Mensual</Option>
              <Option value="year">Anual</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {error && <Alert type="error" message={error} style={{ marginTop: 20 }} />}
      {loading ? (
        <Spin spinning size="large" style={{ width: '100%', marginTop: 50 }} />
      ) : (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Tendencia de Ventas" style={cardStyle}>
                {renderChart('line', salesTrend, lineData(salesTrend))}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Tendencia de Compras" style={cardStyle}>
                {renderChart('line', purchaseTrend, lineData(purchaseTrend))}
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Top Productos Vendidos" style={cardStyle}>
                {renderChart('bar', topProducts, barData(topProducts, 'producto__nombre', 'total_vendido'))}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Top Productos Comprados" style={cardStyle}>
                {renderChart('bar', topPurchased, barData(topPurchased, 'producto__nombre', 'total_comprado'))}
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Card title="Top Clientes que más gastan" style={cardStyle}>
                {renderChart('bar', topClients, barData(topClients, 'cliente_nombre', 'total_gastado'))}
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Productos con Mayor Stock" style={cardStyle}>
                {renderChart('bar', topStock, barData(topStock, 'nombre', 'cantidad'))}
              </Card>
            </Col>
          </Row>

        </>
      )}
    </div>
  );
};

export default Inicio;
