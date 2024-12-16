import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { ChartContainer, ChartConfig } from "~/components/ui/chart";
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
} satisfies ChartConfig;

export default function CategoryPriceDialog({
  categoryId,
  isOpen,
  onClose,
}: {
  categoryId: string;
  isOpen: boolean;
  onClose: (open: boolean) => void;
}) {
  const [data, setData] = useState<{ fecha: string; average_price: number }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Clear previous data when categoryId changes
      setData([]);
      setLoading(true);
      fetch(`${API_BASE_URL}/getCategoryPriceHistory/${categoryId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch data from API");
          }
          return res.json();
        })
        .then((fetchedData) => {
          console.log("API Response:", fetchedData);

          // Ensure valid data
          if (Array.isArray(fetchedData)) {
            setData(
              fetchedData.map((item) => ({
                fecha: item.fecha || "",
                average_price: Number(item.average_price) || 0, // Ensure it's a number
              }))
            );
          } else {
            console.error("API did not return an array:", fetchedData);
            setData([]);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        });
    }
  }, [isOpen, categoryId]);

  // Prepare data for the chart
  const chartData = data.map((item) => ({
    ...item,
    fecha: item.fecha.split("T")[0], // Extract only the date part
  }));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setData([]); // Clear data when the dialog is closed
        }
        onClose(open);
      }}
    >
      <DialogContent className="bg-black w-full max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-orange-500 text-center text-3xl">
            Historial Promedio de Precios por Categoría
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Cargando datos...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-red-500">
            No se encontraron datos para esta categoría.
          </p>
        ) : (
          <div className="bg-black p-4 rounded-lg">
            <ChartContainer config={chartConfig}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 50, left: 10, bottom: 10 }}
                width={1000}
                height={500}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="white" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(tick) =>
                    new Date(tick).toLocaleDateString("es-ES", {
                      month: "short",
                      day: "2-digit",
                    })
                  }
                  stroke="white"
                />
                <YAxis
                  tickFormatter={(value) =>
                    `${typeof value === "number" ? value.toFixed(2) : 0} Q`
                  }
                  domain={["dataMin", "dataMax"]}
                  stroke="white"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const { fecha, average_price } = payload[0].payload;
                      return (
                        <div className="p-2 bg-white border rounded shadow">
                          <p>{`Promedio: ${
                            typeof average_price === "number"
                              ? average_price.toFixed(2)
                              : "0.00"
                          } Q`}</p>
                          <p>{new Date(fecha).toLocaleDateString("es-ES")}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="average_price"
                  stroke="#FFA500"
                  fill="#FFA500"
                  fillOpacity={0.1}
                />
                <Line
                  type="monotone"
                  dataKey="average_price"
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
