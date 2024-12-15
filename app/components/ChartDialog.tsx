import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ChartContainer, ChartConfig} from "~/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
} from "recharts";

const API_BASE_URL = "https://api.hunterprice.online/api";
const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig

export default function ProductPriceDialog({
  productId,
  isOpen,
  onClose,
}: {
  productId: string;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}) {
  const [data, setData] = useState<{ store_name: string; fecha: string; precio: number }[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && data.length === 0) {
      setLoading(true);
      fetch(`${API_BASE_URL}/getHistoryPrice/${productId}`)
        .then((res) => res.json())
        .then((fetchedData) => {
          setData(fetchedData);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isOpen, productId, data.length]);

  // Extract unique store options
  const storeOptions = [...new Set(data.map((item) => item.store_name))];

  // Group data by date and calculate the lowest price
  const groupedData = data.reduce((acc, curr) => {
    const date = curr.fecha.split("T")[0]; // Extract only the date part
    if (!acc[date] || curr.precio < acc[date].precio) {
      acc[date] = { ...curr, fecha: date }; // Take the lowest price
    }
    return acc;
  }, {} as Record<string, { fecha: string; precio: number; store_name: string }>);

  // Prepare data for the chart
  const chartData = selectedStore
    ? data.filter((item) => item.store_name === selectedStore)
    : Object.values(groupedData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="bg-black w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-orange-500 text-center text-3xl">Historial de Precios</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <div className="bg-black p-4 rounded-lg">
            {/* Dropdown for selecting a store */}
            <div className="mb-4">
              <label htmlFor="store-select" className="block text-sm font-medium text-white">
                Selecciona una tienda
              </label>
              <select
                id="store-select"
                className="mt-1 block w-full p-2 border border-gray-300 rounded"
                value={selectedStore || ""}
                onChange={(e) => setSelectedStore(e.target.value || null)}
              >
                <option value="" className="text-white">Todas las Tiendas</option>
                {storeOptions.map((store) => (
                  <option key={store} value={store} className="text-white">
                    {store}
                  </option>
                ))}
              </select>
            </div>

            {/* Line Chart with Area */}
            <ChartContainer
              config={chartConfig}
            >
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 50, left: 10, bottom: 10 }}
                width={1000}
                height={500}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="white" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(tick) => new Date(tick).toLocaleDateString("es-ES", { month: "short", day: "2-digit" })}
                  stroke="white"
                />
                <YAxis
                  tickFormatter={(value) => `${value} Q`}
                  domain={["dataMin", "dataMax"]}
                  stroke="white"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { fecha, precio, store_name } = payload[0].payload;
                      return (
                        <div className="p-2 bg-white border rounded shadow">
                          <p>{`${precio} Q`}</p>
                          <p>{new Date(fecha).toLocaleDateString("es-ES")}</p>
                          <p>{store_name}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="precio"
                  stroke="#FFA500" // Orange line
                  fill="#FFA500"
                  fillOpacity={0.1}
                />
                <Line
                  type="monotone"
                  dataKey="precio"
                  stroke="#FFA500"
                  strokeWidth={2}
                  dot={{ fill: "#FFA500", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
