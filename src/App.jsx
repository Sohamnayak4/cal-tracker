import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { v4 as uuidv4 } from 'uuid';

const COLORS = [
  "#f87171", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa",
  "#f472b6", "#10b981", "#fb923c", "#c084fc", "#818cf8"
];

function App() {
  const [requirements, setRequirements] = useState({
    calorieReq: 2000,
    proteinReq: 100
  });

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    caloriesPerGm: '',
    proteinsPerGm: ''
  });

  const [foods, setFoods] = useState(() => JSON.parse(localStorage.getItem('foods')) || []);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem('foods', JSON.stringify(foods));
  }, [foods]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in requirements) {
      setRequirements({ ...requirements, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', amount: '', caloriesPerGm: '', proteinsPerGm: '' });
    setEditIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, amount, caloriesPerGm, proteinsPerGm } = formData;
    if (!name || !amount || !caloriesPerGm || !proteinsPerGm) return;

    const amt = parseFloat(amount);
    const calPerGm = parseFloat(caloriesPerGm);
    const protPerGm = parseFloat(proteinsPerGm);

    const newFood = {
      id: uuidv4(),
      name,
      amount: amt,
      caloriesPerGm: calPerGm,
      proteinsPerGm: protPerGm,
      totalCalories: amt * calPerGm,
      totalProteins: amt * protPerGm
    };

    if (editIndex !== null) {
      const updatedFoods = [...foods];
      updatedFoods[editIndex] = newFood;
      setFoods(updatedFoods);
    } else {
      setFoods([...foods, newFood]);
    }

    resetForm();
  };

  const handleEdit = (index) => {
    const food = foods[index];
    setFormData({
      name: food.name,
      amount: food.amount,
      caloriesPerGm: food.caloriesPerGm,
      proteinsPerGm: food.proteinsPerGm
    });
    setEditIndex(index);
  };

  const handleClear = () => {
    localStorage.removeItem('foods');
    setFoods([]);
    resetForm();
  };

  const buildGraphData = (type) => {
    const data = foods.reduce((acc, food) => {
      acc[0][food.name] = type === "calories" ? food.totalCalories : food.totalProteins;
      return acc;
    }, [{}]);

    return data;
  };

  const calorieData = buildGraphData("calories");
  const proteinData = buildGraphData("proteins");

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Nutrition Tracker</h1>

      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Daily Requirement</h2>
        <input type="number" name="calorieReq" placeholder="Calorie Requirement" className="w-full p-2 border rounded" value={requirements.calorieReq} onChange={handleChange} />
        <input type="number" name="proteinReq" placeholder="Protein Requirement" className="w-full p-2 border rounded" value={requirements.proteinReq} onChange={handleChange} />
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">
        <input type="text" name="name" placeholder="Food Name" className="w-full p-2 border rounded" value={formData.name} onChange={handleChange} />
        <input type="number" name="amount" placeholder="Amount (gms)" className="w-full p-2 border rounded" value={formData.amount} onChange={handleChange} />
        <input type="number" name="caloriesPerGm" placeholder="Calories per gm" className="w-full p-2 border rounded" value={formData.caloriesPerGm} onChange={handleChange} />
        <input type="number" name="proteinsPerGm" placeholder="Proteins per gm" className="w-full p-2 border rounded" value={formData.proteinsPerGm} onChange={handleChange} />

        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            {editIndex !== null ? 'Update Entry' : 'Add Entry'}
          </button>
          <button type="button" onClick={resetForm} className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400">Reset</button>
        </div>
      </form>

      {foods.length > 0 && (
        <div className="w-full mt-10 max-w-5xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Food List</h2>
            <button onClick={handleClear} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Clear All</button>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Food</th>
                  <th className="p-2 border">Calories</th>
                  <th className="p-2 border">Proteins</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food, index) => (
                  <tr key={food.id} className="border-t">
                    <td className="p-2 border">{food.name}</td>
                    <td className="p-2 border">{food.totalCalories.toFixed(2)}</td>
                    <td className="p-2 border">{food.totalProteins.toFixed(2)}</td>
                    <td className="p-2 border">
                      <button onClick={() => handleEdit(index)} className="text-blue-500 hover:underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calories Chart */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-2 text-center">Calories Intake</h3>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={calorieData} layout="vertical" margin={{ top: 10, right: 30, left: 50, bottom: 10 }}>
                <XAxis type="number" domain={[0, Math.max(requirements.calorieReq, ...calorieData.map(d =>
                  Object.values(d).reduce((sum, val) => sum + val, 0)
                ))]} />
                <YAxis type="category" dataKey={() => 'Calories'} />
                <Tooltip />
                <Legend />
                {foods.map((food, i) => (
                  <Bar key={food.name} dataKey={food.name} fill={COLORS[i % COLORS.length]} stackId="a" />
                ))}
                <ReferenceLine x={parseFloat(requirements.calorieReq)} stroke="#f87171" strokeDasharray="5 5" label="Requirement" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Proteins Chart */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-2 text-center">Proteins Intake</h3>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={proteinData} layout="vertical" margin={{ top: 10, right: 30, left: 50, bottom: 10 }}>
                <XAxis type="number" domain={[0, Math.max(requirements.proteinReq, ...proteinData.map(d =>
                  Object.values(d).reduce((sum, val) => sum + val, 0)
                ))]} />
                <YAxis type="category" dataKey={() => 'Proteins'} />
                <Tooltip />
                <Legend />
                {foods.map((food, i) => (
                  <Bar key={food.name} dataKey={food.name} fill={COLORS[i % COLORS.length]} stackId="b" />
                ))}
                <ReferenceLine x={parseFloat(requirements.proteinReq)} stroke="#60a5fa" strokeDasharray="5 5" label="Requirement" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
