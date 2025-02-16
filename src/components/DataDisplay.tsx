import { useDataLayer } from "@/providers/DataLayerProvider";

export function DataDisplay() {
  const data = useDataLayer((state) => state.data);
  console.log(data);
  if (!data.length) return null;

  const headers = Object.keys(data[0]);

  return (
    <div className="w-full max-w-4xl overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header} className="px-6 py-4 whitespace-nowrap">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
