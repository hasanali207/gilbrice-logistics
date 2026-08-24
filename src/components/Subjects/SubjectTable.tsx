"use client";
import { Loader2, Pencil, Trash } from "lucide-react";

export default function SubjectTable({ subjects, loading }: any) {
  return (
    <div className="border rounded-lg p-3 bg-white shadow">
      <h2 className="text-lg font-semibold mb-3 text-green-700">
        📖 সংরক্ষিত কিতাব তালিকা
      </h2>

      {loading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-green-100 text-left">
              <th className="p-2">#</th>
              <th className="p-2">ক্লাস</th>
              <th className="p-2">নাম</th>
              <th className="p-2">কোড</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s: any, i: number) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{s.className}</td>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.code}</td>
                <td className="p-2 flex justify-center gap-2">
                  <button className="p-1 text-blue-600 hover:text-blue-800">
                    <Pencil size={16} />
                  </button>
                  <button className="p-1 text-red-600 hover:text-red-800">
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
