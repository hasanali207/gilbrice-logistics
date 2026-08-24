"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SubjectForm({ className, onSubmit }: any) {
  const [form, setForm] = useState({ name: "", code: "" });
  const [list, setList] = useState<any[]>([]);

  const addToList = () => {
    if (!form.name) return;
    setList((prev) => [...prev, { ...form }]);
    setForm({ name: "", code: "" });
  };

  const saveAll = async () => {
    if (list.length === 0) return alert("Please add subjects first!");
    await onSubmit(list);
    setList([]);
  };

  return (
    <div className="border rounded-lg p-4 bg-slate-50 shadow-md">
      <h2 className="text-lg font-semibold mb-3 text-green-700">
        ✏️ নতুন কিতাব/বিষয় যোগ করুন
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Input
            placeholder="বিষয়ের নাম (বাংলা)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <Input
            placeholder="বিষয়ের কোড"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={addToList} className="bg-green-700">
            Add
          </Button>
          <Button
            variant="outline"
            onClick={() => setForm({ name: "", code: "" })}
          >
            Clear
          </Button>
        </div>
      </div>

      {list.length > 0 && (
        <div className="mt-4">
          <table className="w-full border">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-2">#</th>
                <th className="p-2">বিষয়</th>
                <th className="p-2">কোড</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.code}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Button onClick={saveAll} className="mt-3 bg-blue-700">
            Save All
          </Button>
        </div>
      )}
    </div>
  );
}
