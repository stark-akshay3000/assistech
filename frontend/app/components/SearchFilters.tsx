"use client";

export default function SearchFilters({
  filters,
  setFilters,
  onSearch
}: any) {

  return (

    <div className="grid grid-cols-4 gap-4">

      <input
        placeholder="Skills"
        className="border p-2"
        onChange={(e) =>
          setFilters({
            ...filters,
            skills:
              e.target.value
          })
        }
      />

      <input
        placeholder="Location"
        className="border p-2"
        onChange={(e) =>
          setFilters({
            ...filters,
            location:
              e.target.value
          })
        }
      />

      <input
        placeholder="Experience"
        className="border p-2"
        type="number"
        onChange={(e) =>
          setFilters({
            ...filters,
            experience:
              e.target.value
          })
        }
      />

      <button
        onClick={onSearch}
        className="bg-black text-white"
      >
        Search
      </button>

    </div>
  );
}