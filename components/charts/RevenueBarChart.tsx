'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatMoney } from '@/lib/currency';

type ChartPoint = { day: string; revenue: number };

export default function RevenueBarChart({ data, height = 300, color = '#0ea5e9', currency = 'PKR' }: { data: ChartPoint[]; height?: number; color?: string; currency?: string }) {
  const axis = { fill: '#6f8da0', fontSize: 11 };
  return <ResponsiveContainer width="100%" height={height}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#d8eaf3" vertical={false}/><XAxis dataKey="day" tick={axis} axisLine={{ stroke: '#d8eaf3' }} tickLine={false}/><YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={value => new Intl.NumberFormat('en-PK', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value))}/><Tooltip formatter={value => [formatMoney(Number(value), currency), 'Revenue']} cursor={{ fill: 'rgba(14,165,233,.08)' }} contentStyle={{ background: '#fff', border: '1px solid #c9e5f2', borderRadius: 10, color: '#17364d', boxShadow: '0 10px 25px rgba(32,105,140,.13)' }}/><Bar dataKey="revenue" fill={color} radius={[6, 6, 0, 0]}/></BarChart></ResponsiveContainer>;
}
